from flask import Flask, render_template, request
from face_reg.recognize_face import recognize_face
from face_reg.register_face import register_face_web
import os
import firebase_admin
from firebase_admin import credentials, storage


app = Flask(__name__)


cred = credentials.Certificate("serviceAccountKey.json")  # your downloaded service account key
firebase_admin.initialize_app(cred, {
    'storageBucket': 'attendance-system-17195.firebasestorage.app'
})
bucket = storage.bucket()



@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        image = request.files.get('image')
        if not image:
            return "⚠️ No image uploaded"

        result = recognize_face(image)
        return result

    return render_template('index.html')


# ---  Register face route ---
@app.route('/register', methods=['POST'])
def register_face_route():
    name = request.form.get('name')
    image = request.files.get('image')
    if not name or not image:
        return "⚠️ Missing name or image", 400

    msg = register_face_web(name, image)
    return msg


if __name__ == '__main__':
    os.makedirs("data", exist_ok=True)
    app.run(debug=True)