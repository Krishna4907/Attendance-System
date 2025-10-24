# Smart Attendance System

## Overview
Smart Attendance System is a Python-based application that automates attendance tracking using face recognition. It allows schools, offices, and organizations to maintain accurate attendance records without manual intervention.

The system registers faces of users, recognizes them in real-time, and logs their attendance securely in a database.

---

## Features
- **Face Registration:** Add new users by capturing their face data.
- **Face Recognition:** Detect and recognize registered faces in real-time.
- **Attendance Logging:** Automatically logs attendance with date and time.
- **Web Interface:** Simple UI to view attendance records.
- **Secure Storage:** Attendance and user data stored securely.

---

## Tech Stack
- Programming Language: Python 3
- Framework: Flask (for the web interface)
- Face Recognition: OpenCV, face_recognition library
- Database:  Firebase 
- Frontend: HTML, CSS, JavaScript
- Other Libraries: NumPy, Pandas, edge detection ,mediapipe

## Installation & Setup

1.Clone the repository to your local machine.

2.Create a virtual environment in the project folder to isolate dependencies.

3.Activate the virtual environment

4.Windows: venv\Scripts\activate

5.Linux/Mac: source venv/bin/activate

6.Install dependencies using the requirements.txt file.

7.Run the application by executing app.py.

8.Open the web interface in your browser at your local host to register users and mark attendance.

## Requirement Lib
1.Flask==2.3.2.

2.opencv-python==4.12.0.

3.face_recognition==1.3.0.

4.numpy==1.25.2.

5.pandas==2.1.1.




