import os
import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.utils import to_categorical
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

# --- CONFIGURATION ---
# 1. Define where the data is
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
IMG_SIZE = 128  # We resize all images to 128x128 pixels

print(f"Looking for data in: {DATA_DIR}")

def load_data():
    images = []
    labels = []
    
    # Get all folder names (A, B, C...)
    if not os.path.exists(DATA_DIR):
        print("❌ Error: Data folder not found!")
        return None, None, None

    classes = sorted(os.listdir(DATA_DIR))
    print(f"Found {len(classes)} classes: {classes}")

    for label in classes:
        path = os.path.join(DATA_DIR, label)
        if not os.path.isdir(path):
            continue
            
        print(f"Loading class: {label}...")
        
        # Read every image in the folder
        for img_name in os.listdir(path):
            try:
                img_path = os.path.join(path, img_name)
                # Read image
                img_array = cv2.imread(img_path)
                if img_array is None:
                    continue
                    
                # Resize image to standard size
                img_resized = cv2.resize(img_array, (IMG_SIZE, IMG_SIZE))
                
                images.append(img_resized)
                labels.append(label)
            except Exception as e:
                pass

    return np.array(images), np.array(labels), classes

# --- MAIN EXECUTION ---
if __name__ == "__main__":
    print("🚀 Starting Data Loading...")
    X, y, class_names = load_data()

    if X is None or len(X) == 0:
        print("❌ No images found. Did you paste the 'A-Z' folders into 'backend/ml_model/data'?")
        exit()

    print(f"✅ Loaded {len(X)} images successfully.")

    # 1. Convert labels (A, B, C) into numbers (0, 1, 2)
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    y_one_hot = to_categorical(y_encoded)

    # 2. Normalize image data (0-255 -> 0-1)
    X = X.astype('float32') / 255.0

    # 3. Split into Training (80%) and Testing (20%)
    X_train, X_test, y_train, y_test = train_test_split(X, y_one_hot, test_size=0.2, random_state=42)

    # 4. Build the AI Brain (CNN Model)
    model = Sequential([
        Conv2D(32, (3, 3), activation='relu', input_shape=(IMG_SIZE, IMG_SIZE, 3)),
        MaxPooling2D(2, 2),
        
        Conv2D(64, (3, 3), activation='relu'),
        MaxPooling2D(2, 2),
        
        Conv2D(128, (3, 3), activation='relu'),
        MaxPooling2D(2, 2),
        
        Flatten(),
        Dense(128, activation='relu'),
        Dropout(0.5),
        Dense(len(class_names), activation='softmax') # Output layer
    ])

    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

    # 5. Train the Model
    print("🧠 Training started... (This may take 15-30 mins)")
    history = model.fit(X_train, y_train, epochs=10, validation_data=(X_test, y_test), batch_size=32)

    # 6. Save the trained brain
    model.save('isl_model.h5')
    
    # Save the class names so we know 0=A, 1=B, etc.
    np.save('class_names.npy', class_names)
    
    print("🎉 Success! Model saved as 'isl_model.h5'")