/*
 * ESP32_Currency_Classification.ino
 * 
 * Klasifikasi mata uang Indonesia berdasarkan warna RGB
 * Membandingkan performa KNN dan Decision Tree
 */

#define ENABLE_MODULE_DECISION_TREE
#define ENABLE_MODULE_KNN
#include "Kinematrix.h"

// Membuat instance KNN dan Decision Tree
KNN currencyKNN(5, 3, 30);       // k=5, 3 fitur (R,G,B), max 30 data
DecisionTree currencyDT(3, 30);  // 3 fitur (R,G,B), max 30 data

// Buffer untuk input serial
String inputString = "";
boolean stringComplete = false;

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\nKlasifikasi Mata Uang Indonesia - KNN vs Decision Tree");
  Serial.println("----------------------------------------------------");

  // Menambahkan data training untuk KNN dan Decision Tree
  // Data dummy untuk Rp 2000 (dominan abu-abu)
  Serial.println("Menambahkan data training Rp 2000 (abu-abu)...");
  addTrainingData("Rp_2000", 120, 120, 120);
  addTrainingData("Rp_2000", 110, 110, 115);
  addTrainingData("Rp_2000", 130, 125, 125);
  addTrainingData("Rp_2000", 115, 115, 110);
  addTrainingData("Rp_2000", 125, 120, 130);
  addTrainingData("Rp_2000", 105, 110, 105);
  addTrainingData("Rp_2000", 115, 105, 115);
  addTrainingData("Rp_2000", 130, 130, 125);

  // Data dummy untuk Rp 5000 (dominan coklat/oranye)
  Serial.println("Menambahkan data training Rp 5000 (coklat/oranye)...");
  addTrainingData("Rp_5000", 200, 120, 50);
  addTrainingData("Rp_5000", 210, 130, 60);
  addTrainingData("Rp_5000", 190, 110, 40);
  addTrainingData("Rp_5000", 205, 125, 55);
  addTrainingData("Rp_5000", 195, 115, 45);
  addTrainingData("Rp_5000", 215, 135, 65);
  addTrainingData("Rp_5000", 185, 105, 35);
  addTrainingData("Rp_5000", 205, 130, 60);

  // Data dummy untuk Rp 10000 (dominan ungu)
  Serial.println("Menambahkan data training Rp 10000 (ungu)...");
  addTrainingData("Rp_10000", 140, 80, 180);
  addTrainingData("Rp_10000", 150, 90, 190);
  addTrainingData("Rp_10000", 130, 70, 170);
  addTrainingData("Rp_10000", 145, 85, 185);
  addTrainingData("Rp_10000", 135, 75, 175);
  addTrainingData("Rp_10000", 155, 95, 195);
  addTrainingData("Rp_10000", 125, 65, 165);
  addTrainingData("Rp_10000", 145, 90, 180);

  // Melatih model KNN
  // KNN tidak memerlukan training eksplisit, data sudah disimpan
  Serial.println("Model KNN siap digunakan");

  // Melatih model Decision Tree
  Serial.println("Melatih model Decision Tree...");
  if (currencyDT.train(GINI)) {
    Serial.println("Model Decision Tree siap digunakan");
  } else {
    Serial.println("Gagal melatih model Decision Tree");
  }

  // Menampilkan evaluasi model dengan cross-validation
  float knnAccuracy = currencyKNN.crossValidate(3);
  float dtAccuracy = currencyDT.crossValidate(3);

  Serial.print("Akurasi KNN (3-fold CV): ");
  Serial.print(knnAccuracy * 100.0);
  Serial.println("%");

  Serial.print("Akurasi Decision Tree (3-fold CV): ");
  Serial.print(dtAccuracy * 100.0);
  Serial.println("%");

  // Instruksi untuk pengguna
  Serial.println("\nMasukkan nilai RGB untuk klasifikasi (format: R,G,B)");
  Serial.println("Contoh: 120,120,120");
}

void loop() {
  // Membaca input dari Serial Monitor
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    if (inChar == '\n') {
      stringComplete = true;
    } else {
      inputString += inChar;
    }
  }

  // Memproses input jika sudah lengkap
  if (stringComplete) {
    // Memproses string input
    int r = -1, g = -1, b = -1;

    // Parsing nilai RGB
    int firstComma = inputString.indexOf(',');
    int secondComma = inputString.indexOf(',', firstComma + 1);

    if (firstComma > 0 && secondComma > firstComma) {
      r = inputString.substring(0, firstComma).toInt();
      g = inputString.substring(firstComma + 1, secondComma).toInt();
      b = inputString.substring(secondComma + 1).toInt();
    }

    // Validasi nilai RGB
    if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
      Serial.print("\nInput diterima: R=");
      Serial.print(r);
      Serial.print(", G=");
      Serial.print(g);
      Serial.print(", B=");
      Serial.println(b);

      // Menyiapkan data untuk klasifikasi
      float features[] = { (float)r, (float)g, (float)b };

      // Klasifikasi dengan KNN
      const char* knnPrediction = currencyKNN.predict(features);
      float knnConfidence = currencyKNN.getPredictionConfidence(features);

      // Klasifikasi dengan Decision Tree
      const char* dtPrediction = currencyDT.predict(features);

      // Menampilkan hasil
      Serial.println("\nHasil Klasifikasi:");
      Serial.print("KNN: ");
      Serial.print(knnPrediction);
      Serial.print(" (confidence: ");
      Serial.print(knnConfidence * 100.0);
      Serial.println("%)");

      Serial.print("Decision Tree: ");
      Serial.println(dtPrediction);

      // Menambahkan rekomendasi berdasarkan confidence
      if (strcmp(knnPrediction, dtPrediction) == 0) {
        Serial.print("Kedua model sepakat: mata uang ini kemungkinan ");
        Serial.println(knnPrediction);
      } else {
        Serial.println("Model tidak sepakat. Rekomendasi:");
        if (knnConfidence > 0.7) {
          Serial.print("Lebih mungkin ");
          Serial.println(knnPrediction);
        } else {
          Serial.println("Hasil tidak pasti, periksa mata uang secara visual");
        }
      }
    } else {
      Serial.println("Input tidak valid. Gunakan format: R,G,B (nilai 0-255)");
    }

    // Reset input
    inputString = "";
    stringComplete = false;

    // Instruksi untuk pengujian berikutnya
    Serial.println("\nMasukkan nilai RGB untuk klasifikasi berikutnya (format: R,G,B)");
  }

  // Delay kecil untuk stabilitas
  delay(10);
}

// Fungsi untuk menambahkan data training ke kedua model
void addTrainingData(const char* label, int r, int g, int b) {
  float features[] = { (float)r, (float)g, (float)b };

  // Tambahkan ke KNN
  currencyKNN.addTrainingData(label, features);

  // Tambahkan ke Decision Tree
  currencyDT.addTrainingData(label, features);
}