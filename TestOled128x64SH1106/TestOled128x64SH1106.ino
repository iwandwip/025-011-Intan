#include <Arduino.h>
#include <Wire.h>
#include "SH1106Wire.h"

// Inisialisasi display OLED dengan alamat I2C 0x3c, pin SDA di GPIO 5, dan pin SCL di GPIO 4
SH1106Wire display(0x3C, 21, 22);  // Alamat, SDA, SCL

void setup() {
  Serial.begin(115200);
  Serial.println("Memulai contoh SH1106 OLED...");

  // Inisialisasi display
  display.init();

  // Rotasi display bisa disesuaikan (opsional)
  // display.flipScreenVertically();

  // Mengatur font
  display.setFont(ArialMT_Plain_10);

  // Membersihkan display
  display.clear();

  // Menentukan alignment text
  display.setTextAlignment(TEXT_ALIGN_LEFT);

  // Menggambar text di posisi (0, 0)
  display.drawString(0, 0, "Hello World!");

  // Alignment text di tengah
  display.setTextAlignment(TEXT_ALIGN_CENTER);
  display.drawString(64, 22, "SH1106 OLED");

  // Menggambar garis dari (0,32) ke (127,32)
  display.drawLine(0, 32, 127, 32);

  // Menggambar kotak kosong
  display.drawRect(10, 40, 107, 20);

  // Menggambar kotak terisi
  display.fillRect(20, 45, 87, 10);

  // Mengaktifkan display (dibutuhkan setelah melakukan operasi penggambaran)
  display.display();
}

void loop() {
  // Contoh sederhana animasi progress bar
  static int progress = 0;

  display.clear();
  display.setTextAlignment(TEXT_ALIGN_CENTER);
  display.setFont(ArialMT_Plain_10);
  display.drawString(64, 10, "Progress Bar Demo");

  // Menggambar progress bar
  display.drawProgressBar(10, 32, 107, 10, progress);

  // Menampilkan persentase
  display.setTextAlignment(TEXT_ALIGN_CENTER);
  display.drawString(64, 48, String(progress) + "%");

  // Menampilkan ke display
  display.display();

  // Menambah progress
  progress = (progress + 5) % 100;

  delay(200);
}