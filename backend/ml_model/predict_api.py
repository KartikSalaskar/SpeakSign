from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import cv2
import mediapipe as mp
import os

app = Flask(__name__)
CORS(app)

# --- 1. LOAD YOUR MODEL ---
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'isl_model.h5')
CLASSES_PATH = os.path.join(os.path.dirname(__file__), 'class_names.npy')

try:
    model = tf.keras.models.load_model(MODEL_PATH)
    class_names = np.load(CLASSES_PATH)
    print("✅ Model Loaded Successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    exit()

# --- 2. SETUP HAND DETECTOR (The Magic Part) ---
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=True, max_num_hands=1, min_detection_confidence=0.5)

def crop_hand_from_image(image):
    """
    Finds a hand in the image and crops it out.
    If no hand is found, it returns the original image.
    """
    # Convert to RGB for MediaPipe
    img_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = hands.process(img_rgb)

    if results.multi_hand_landmarks:
        hand_landmarks = results.multi_hand_landmarks[0]
        h, w, _ = image.shape
        
        # Calculate Bounding Box around the hand
        x_min, y_min = w, h
        x_max, y_max = 0, 0
        
        for lm in hand_landmarks.landmark:
            x, y = int(lm.x * w), int(lm.y * h)
            x_min = min(x_min, x)
            y_min = min(y_min, y)
            x_max = max(x_max, x)
            y_max = max(y_max, y)
            
        # Add some padding (margin) so we don't cut off fingertips
        padding = 40
        x_min = max(0, x_min - padding)
        y_min = max(0, y_min - padding)
        x_max = min(w, x_max + padding)
        y_max = min(h, y_max + padding)
        
        # Crop!
        cropped_img = image[y_min:y_max, x_min:x_max]
        
        # Check if crop is valid (not empty)
        if cropped_img.size > 0:
            print("✂️ Hand Detected & Cropped!")
            return cropped_img

    print("⚠️ No hand detected - using full image.")
    return image

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image'}), 400

    # Read Image
    file = request.files['image']
    npimg = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
    
    if img is None: return jsonify({'error': 'Invalid image'}), 400

    # --- STEP A: CROP THE HAND ---
    processed_img = crop_hand_from_image(img)
    
    # (Optional) Save this to see what the AI is looking at
    cv2.imwrite("debug_cropped.jpg", processed_img)

    # --- STEP B: PREPARE FOR AI ---
    # Resize to 128x128 (What the model expects)
    img_resized = cv2.resize(processed_img, (128, 128))
    # Normalize (0-1)
    img_final = img_resized.astype('float32') / 255.0
    # Add batch dimension
    img_final = np.expand_dims(img_final, axis=0)
    
    # --- STEP C: PREDICT ---
    predictions = model.predict(img_final)
    score = tf.nn.softmax(predictions[0])
    predicted_class = class_names[np.argmax(score)]
    confidence = 100 * np.max(score)

    print(f"🧠 AI Sees: {predicted_class} ({confidence:.2f}%)")

    return jsonify({
        'prediction': str(predicted_class),
        'confidence': float(confidence)
    })

if __name__ == '__main__':
    app.run(port=8000)