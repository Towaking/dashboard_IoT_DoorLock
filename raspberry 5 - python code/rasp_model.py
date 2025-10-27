
import os
import cv2
import serial
import numpy as np
import face_recognition
from ultralytics import YOLO
from pathlib import Path
from datetime import datetime, timedelta
import subprocess
import time
import requests


# Konfigurasi
DATASET_PATH = 'foto'
MODEL_PATH = 'model/yolov8n-face.pt'
TOLERANCE = 0.45
CAPTURE_PATH = Path("tmp_capture.jpg")
CAPTURE_INTERVAL = 1  # detik antar capture
BACKEND_URL = "http://10.175.209.151:5000/api/logs/callback" # API nya ganti ama ipv4 di ipconfig


# Serial dari ESP
ser = serial.Serial("/dev/serial0", baudrate=9600, timeout=2)

# Load Model YOLO
print("📦 Memuat model YOLO...")
model = YOLO(MODEL_PATH)


print(f"📁 Memuat dataset dari: {DATASET_PATH}")
known_encodings = []
known_names = []

for fname in os.listdir(DATASET_PATH):
    if fname.lower().endswith(('.jpg', '.jpeg', '.png')):
        path = os.path.join(DATASET_PATH, fname)
        img = face_recognition.load_image_file(path)
        enc = face_recognition.face_encodings(img)
        if len(enc) > 0:
            known_encodings.append(enc[0])
            known_names.append(os.path.splitext(fname)[0])
        else:
            print(f"⚠️ Tidak ditemukan wajah di {fname}")

print(f"✅ Dataset selesai dimuat: {known_names}")


def capture_rpicam(file_path):
    try:
        subprocess.run(
            ["rpicam-still", "--nopreview", "-t", "1000", "-o", str(file_path)],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        print(f"📸 Foto disimpan di {file_path}")
        return str(file_path)
    except Exception as e:
        print("❌ Gagal ambil foto:", e)
        return None

def recognize_from_file(file_path):
    frame = cv2.imread(file_path)
    if frame is None:
        print("❌ Gagal membaca file foto")
        return None
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    results = model.predict(source=frame, verbose=False)
    boxes = results[0].boxes.xyxy.cpu().numpy() if len(results) > 0 else []

    encodings = face_recognition.face_encodings(rgb)
    if not encodings:
        print("👤 Tidak ada wajah yang bisa di-encode")
        return None

    for idx, encoding in enumerate(encodings):
        name = "Unknown"
        if known_encodings:
            distances = face_recognition.face_distance(known_encodings, encoding)
            best_idx = np.argmin(distances)
            if distances[best_idx] <= TOLERANCE:
                name = known_names[best_idx]
                print(f"✅ Wajah dikenali: {name}")
            else:
                print("👤 Wajah tidak dikenali")

        if idx < len(boxes):
            x1, y1, x2, y2 = boxes[idx]
            print(f"📍 Koordinat YOLO: {int(x1)},{int(y1)},{int(x2)},{int(y2)}")

        return name

print("📡 Menunggu perintah dari ESP...")

while True:
    if ser.in_waiting:
        msg = ser.readline().decode().strip()
        print(f"📨 Diterima dari ESP: {msg}")
        # msg = "OPEN CAMERA"
        if msg.startswith("OPEN CAMERA"):
            parts = msg.split()
            user_id = parts[2] if len(parts) > 2 else "unknown"
            print(f"🎥 Perintah buka kamera untuk ID: {user_id}")

            ser.write(b"YES\n")

            recognized_name = None
            attempts = 0
            max_attempts = 5

            while attempts < max_attempts and recognized_name is None:
                attempts += 1
                print(f"🔍 Percobaan ke-{attempts}...")
                file_path = capture_rpicam(CAPTURE_PATH)
                if file_path:
                    recognized_name = recognize_from_file(file_path)
                if recognized_name == "Unknown" or recognized_name is None:
                    time.sleep(CAPTURE_INTERVAL)
                    recognized_name = None  # pastikan tetap retry
                else:
                    break

            if recognized_name and recognized_name != "Unknown":
                print(f"🎉 Wajah {recognized_name} dikenali!")
                ser.write(f"RECOGNIZED {recognized_name}\n".encode())
            else:
                print("❌ Tidak ada wajah dikenali setelah 5 kali percobaan.")
                recognized_name = "Unknown"
                ser.write(b"NO\n")

            # Kirim log ke backend
            try:
                now = datetime.utcnow() + timedelta(hours=7)

                payload = {
                    "date": now.strftime("%Y-%m-%d"),
                    "time": now.strftime("%H:%M:%S"),
                    "user_name": recognized_name,
                    "fingerprint_id": user_id,
                    "note": "Wajah dikenali via kamera"
                }
                headers = {"x-callback-secret": "supercallbacksecret"}
                res = requests.post(BACKEND_URL, json=payload, headers=headers, timeout=5)
                print(f"✅ Log terkirim ke backend: {res.status_code}")
            except Exception as e:
                print("❌ Error kirim log ke backend:", e)
