import face_recognition
import numpy as np
import pickle
from PIL import Image
from firebase_admin import storage

def register_face_web(name, image_file):
    """Register a user's face and upload to Firebase Storage."""
    image = Image.open(image_file)
    if image.mode != 'RGB':
        image = image.convert('RGB')
    image = np.array(image)

    face_locs = face_recognition.face_locations(image)
    if not face_locs:
        return " ❎No face detected."

    enc = face_recognition.face_encodings(image, face_locs)[0]

 
    enc_bytes = pickle.dumps(enc)

    # Upload to Firebase Storage
    blob = storage.bucket().blob(f"faces/{name}.pkl")
    blob.upload_from_string(enc_bytes, content_type='application/octet-stream')

    return f" ✔️Face registered successfully for {name} (stored in data)!"