import face_recognition
import pickle
import numpy as np
from PIL import Image
from firebase_admin import storage

def recognize_face(image_file):
    """Recognize a face from uploaded or webcam image using Firebase-stored encodings."""
    image = Image.open(image_file)
    if image.mode != 'RGB':
        image = image.convert('RGB')
    image = np.array(image)

    bucket = storage.bucket()
    blobs = list(bucket.list_blobs(prefix="faces/"))
    if not blobs:
        return "⚠️ No registered faces found in Firebase. Please register first."

    known_encodings = {}
    for blob in blobs:
        if blob.name.endswith(".pkl"):
            name = blob.name.split("/")[-1].replace(".pkl", "")
            enc = pickle.loads(blob.download_as_bytes())
            known_encodings[name] = enc

    face_locs = face_recognition.face_locations(image)
    if not face_locs:
        return "⚠️ No face detected."

    encodings = face_recognition.face_encodings(image, face_locs)
    results = []

    for e in encodings:
        matches = face_recognition.compare_faces(list(known_encodings.values()), e)
        name = "Unknown"
        if True in matches:
            name = list(known_encodings.keys())[matches.index(True)]
            results.append(f"✅ Attendance marked for {name}")
        else:
            results.append("❌ Unknown Face")

    return "<br>".join(results)
