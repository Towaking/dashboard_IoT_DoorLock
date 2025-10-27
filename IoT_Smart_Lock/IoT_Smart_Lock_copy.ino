#define BLYNK_TEMPLATE_ID "TMPL6v2bwU2Rh"
#define BLYNK_TEMPLATE_NAME "Test"
#define BLYNK_AUTH_TOKEN "aAVTgKAs4SGcexx4Hqu6Ht0ydWzC0Qes"

#include <WiFi.h>
#include <WiFiClient.h>
#include <BlynkSimpleEsp32.h>
#include <HardwareSerial.h>
#include <ESP32Servo.h>
#include <Adafruit_Fingerprint.h>

// -------- WiFi & Blynk --------
char ssid[] = "Wilhelm";
char pass[] = "55555555";

// -------- Raspberry Serial --------
HardwareSerial raspiSerial(1);
const int RASPI_RX = 22;
const int RASPI_TX = 23;

// -------- Fingerprint --------
HardwareSerial fingerSerial(2);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&fingerSerial);
const int FINGER_RX = 16;
const int FINGER_TX = 17;

// -------- Servo --------
Servo myservo;
const int servoPin = 32;
String doorState = "CLOSE";

// -------- Timer --------
BlynkTimer timer;

// -------- Pin Virtual --------
#define VPIN_SWITCH  V0
#define VPIN_SERVO   V1
#define VPIN_FINGER  V2
#define VPIN_CAMERA  V3
#define VPIN_REG     V4   // tombol register
#define VPIN_REMOVE  V5   // tombol remove

// -------- Helper --------
void setDoorState(String state) {
  if (state == "OPEN") {
    myservo.write(90);
    doorState = "OPEN";
    Blynk.virtualWrite(VPIN_SERVO, "OPEN");
  } else {
    myservo.write(0);
    doorState = "CLOSE";
    Blynk.virtualWrite(VPIN_SERVO, "CLOSE");
  }
  Serial.print("Door state: ");
  Serial.println(doorState);
}

// -------- Switch manual dari Blynk --------
BLYNK_WRITE(VPIN_SWITCH) {
  int value = param.asInt();
  if (value == 1 && doorState == "CLOSE") {
    setDoorState("OPEN");
  } else if (value == 0 && doorState == "OPEN") {
    setDoorState("CLOSE");
  }
}

// -------- Tombol register --------
BLYNK_WRITE(VPIN_REG) {
  int value = param.asInt();
  if (value == 1) {
    Serial.println("🟢 Register fingerprint mode");
    Blynk.virtualWrite(VPIN_REG, 0);
    enrollFingerprint();
  }
}

// -------- Tombol remove --------
BLYNK_WRITE(VPIN_REMOVE) {
  int value = param.asInt();
  if (value == 1) {
    Serial.println("🟥 Remove fingerprint mode");
    Blynk.virtualWrite(VPIN_REMOVE, 0);
    deleteFingerprint();
  }
}

// -------- Setup --------
void setup() {
  Serial.begin(115200);
  delay(2000);
  Serial.println("Booting...");

  WiFi.begin(ssid, pass);
  Serial.print("Connecting to WiFi");

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 20) {
    delay(500);
    Serial.print(".");
    retries++;
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("✅ WiFi connected!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("❌ WiFi not connected.");
  }

  Blynk.config(BLYNK_AUTH_TOKEN);
  Blynk.connect(5000);

  myservo.attach(servoPin);
  setDoorState("CLOSE");

  raspiSerial.begin(9600, SERIAL_8N1, RASPI_RX, RASPI_TX);

  fingerSerial.begin(57600, SERIAL_8N1, FINGER_RX, FINGER_TX);
  finger.begin(57600);

  if (finger.verifyPassword()) {
    Serial.println("✅ Fingerprint sensor ready");
  } else {
    Serial.println("❌ Fingerprint sensor ERROR");
  }

  timer.setInterval(200L, checkFingerprint);
  Serial.println("=== System Ready ===");
}

// -------- Loop --------
void loop() {
  Blynk.run();
  timer.run();

  if (raspiSerial.available()) {
    String resp = raspiSerial.readStringUntil('\n');
    resp.trim();
    Serial.print("Raspi says: ");
    Serial.println(resp);

    if (resp.startsWith("RECOGNIZED")) {
      // contoh: "RECOGNIZED Goldwin"
      String name = resp.substring(11); // ambil nama setelah kata "RECOGNIZED "
      Serial.print("🎉 Wajah dikenali: ");
      Serial.println(name);

      Blynk.virtualWrite(VPIN_CAMERA, 1);
      setDoorState("OPEN");
      delay(2000);
      setDoorState("CLOSE");
      Blynk.virtualWrite(VPIN_CAMERA, 0);
    } 
    else if (resp == "NO") {
      Serial.println("❌ Wajah tidak dikenali, pintu tetap terkunci");
    }
    else if (resp == "YES") {
      Serial.println("📸 Kamera aktif, menunggu wajah...");
    }
  }
}

/// -------- Fingerprint Check --------
void checkFingerprint() {
  int id = getFingerprintID();
  if (id > 0) {
    Serial.print("Fingerprint valid, ID ");
    Serial.println(id);

    Blynk.virtualWrite(VPIN_FINGER, 1);

    // Kirim ke Raspberry ID-nya
    raspiSerial.print("OPEN CAMERA ");
    raspiSerial.println(id);
    raspiSerial.flush();
    delay(50);

    Serial.println("OPEN CAMERA -> Raspi");

    timer.setTimeout(1000, []() {
      Blynk.virtualWrite(VPIN_FINGER, 0);
    });
  }
}

// -------- Cari ID fingerprint valid --------
int getFingerprintID() {
  int p = finger.getImage();
  if (p != FINGERPRINT_OK) return -1;
  p = finger.image2Tz();
  if (p != FINGERPRINT_OK) return -1;
  p = finger.fingerSearch();
  if (p == FINGERPRINT_OK) return finger.fingerID;
  return -1;
}

// -------- ENROLL fingerprint --------
void enrollFingerprint() {
  int id = 1;
  while (finger.loadModel(id) == FINGERPRINT_OK) {
    id++;
  }
  Serial.print("📥 Register ID: ");
  Serial.println(id);

  Serial.println("Tempelkan jari Anda...");
  while (finger.getImage() != FINGERPRINT_OK);

  finger.image2Tz(1);
  Serial.println("Lepaskan jari...");
  delay(2000);

  Serial.println("Tempelkan kembali jari yang sama...");
  while (finger.getImage() != FINGERPRINT_OK);

  finger.image2Tz(2);
  if (finger.createModel() == FINGERPRINT_OK) {
    if (finger.storeModel(id) == FINGERPRINT_OK) {
      Serial.println("✅ Fingerprint berhasil disimpan!");
      Blynk.logEvent("fingerprint_enrolled", "Fingerprint berhasil disimpan");
    } else {
      Serial.println("❌ Gagal menyimpan fingerprint");
    }
  } else {
    Serial.println("❌ Jari tidak cocok, ulangi");
  }
}

// -------- DELETE fingerprint --------
void deleteFingerprint() {
  Serial.println("Masukkan ID yang ingin dihapus (default: 1)");
  int id = 1;
  // Bisa kamu ubah nanti jadi baca dari Blynk Numeric Input

  if (finger.deleteModel(id) == FINGERPRINT_OK) {
    Serial.print("🗑️ Fingerprint ID ");
    Serial.print(id);
    Serial.println(" berhasil dihapus!");
    Blynk.logEvent("fingerprint_deleted", "Fingerprint berhasil dihapus");
  } else {
    Serial.println("❌ Gagal menghapus fingerprint");
  }
}
