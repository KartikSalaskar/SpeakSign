from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import cv2
import os

app = Flask(__name__)
CORS(app)

# Load Model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'isl_model.h5')
CLASSES_PATH = os.path.join(os.path.dirname(__file__), 'class_names.npy')
model = tf.keras.models.load_model(MODEL_PATH)
class_names = np.load(CLASSES_PATH)
print("✅ Model Loaded!")

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files: return jsonify({'error': 'No image'}), 400

    # Read Image
    file = request.files['image']
    npimg = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    # --- 📸 DEBUG STEP: THIS SAVES THE IMAGE ---
    # Every time you click "Capture", this file is overwritten.
    cv2.imwrite("debug_check.jpg", img)
    print("📸 Saved debug_check.jpg to ml_model folder")
    # -------------------------------------------

    # Predict
    img_resized = cv2.resize(img, (128, 128))
    img_final = img_resized.astype('float32') / 255.0
    img_final = np.expand_dims(img_final, axis=0)
    
    predictions = model.predict(img_final)
    score = tf.nn.softmax(predictions[0])
    predicted_class = class_names[np.argmax(score)]
    confidence = 100 * np.max(score)

    return jsonify({'prediction': str(predicted_class), 'confidence': float(confidence)})

if __name__ == '__main__':
    app.run(port=8000)