from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import cv2
import os

app = Flask(__name__)
CORS(app) # Allow other servers to talk to this

# --- CONFIGURATION ---
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'isl_model.h5')
CLASSES_PATH = os.path.join(os.path.dirname(__file__), 'class_names.npy')

print("⏳ Loading Model...")
try:
    model = tf.keras.models.load_model(MODEL_PATH)
    class_names = np.load(CLASSES_PATH)
    print("✅ Model Loaded Successfully!")
    print(f"Classes: {class_names}")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    exit()

def preprocess_image(image):
    # Resize to match training size
    img = cv2.resize(image, (128, 128))
    # Normalize (0-1)
    img = img.astype('float32') / 255.0
    # Add batch dimension (1, 128, 128, 3)
    img = np.expand_dims(img, axis=0)
    return img

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    
    # Convert string data to numpy array
    npimg = np.frombuffer(file.read(), np.uint8)
    # Convert numpy array to image
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
    
    if img is None:
        return jsonify({'error': 'Invalid image'}), 400

    # Prepare image for AI
    processed_img = preprocess_image(img)
    
    # Ask AI for prediction
    predictions = model.predict(processed_img)
    score = tf.nn.softmax(predictions[0])
    
    # Get result
    predicted_class = class_names[np.argmax(score)]
    confidence = 100 * np.max(score)

    print(f"🔍 Predicted: {predicted_class} ({confidence:.2f}%)")

    return jsonify({
        'prediction': str(predicted_class),
        'confidence': float(confidence)
    })

if __name__ == '__main__':
    # Run on Port 8000 (Different from Node's 5000)
    app.run(port=8000, debug=True)