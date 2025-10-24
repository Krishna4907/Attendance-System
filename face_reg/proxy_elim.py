# import mediapipe as mp
# import cv2

# def liveness_check():
#     mp_face = mp.solutions.face_mesh
#     face_mesh = mp_face.FaceMesh(refine_landmarks=True)
#     cap = cv2.VideoCapture(0)
#     blink_detected = False

#     while True:
#         ret, frame = cap.read()
#         rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#         result = face_mesh.process(rgb)
#         if result.multi_face_landmarks:
#             blink_detected = True
#             break

#         cv2.imshow("Liveness Check", frame)
#         if cv2.waitKey(1) & 0xFF == ord('q'):
#             break

#     cap.release()
#     cv2.destroyAllWindows()
#     return blink_detected
