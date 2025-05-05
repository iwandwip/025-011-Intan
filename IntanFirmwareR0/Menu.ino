void lcdMenuCallback() {
  static auto mainMenu = menu.createMenu(4, "Kalibrasi", "Tare", "Daftar", "Test Sensor");

  menu.onSelect(mainMenu, "Kalibrasi", []() {
    auto loadCell = sensor.getModule<HX711Sens>("lCell");

    const char* kalibrasilines1[] = { "Hilangkan Semua", "Objek Pada", "Timbangan" };
    menu.renderBoxedText(kalibrasilines1, 3);
    loadCell->setScaleDelay(5000);

    const char* kalibrasilines2[] = { "Letakan", "Objek Yang", "Terukur (2 KG)" };
    menu.renderBoxedText(kalibrasilines2, 3);
    loadCell->tareDelay(5000);

    float units = loadCell->getUnits(10);
    float cal = loadCell->getCalibrateFactor(units, KG_TO_G(2));
    Serial.printf("| Cal Factor: %.2f\n", cal);

    preferences.begin("intan", false);
    preferences.putFloat("cal", cal);
    preferences.end();

    loadCell->setScale(cal);
    menu.renderStatusScreen("Tare Loadcell", "Berhasil", true);
    delay(5000);

    loadCell->tare();
    menu.clearMenu(mainMenu, menu.end());
  });

  menu.onSelect(mainMenu, "Tare", []() {
    auto loadCell = sensor.getModule<HX711Sens>("lCell");
    loadCell->tare();
    menu.renderStatusScreen("Tare Loadcell", "Berhasil", true);
    delay(2000);
    menu.clearMenu(mainMenu, menu.end());
  });

  menu.onSelect(
    mainMenu, "Daftar", []() {
      uuidRFID = "";
    },
    []() {
      const char* tapRFIDlines[] = { "Silahkan Tap", "Kartu RFID", "Anda" };
      menu.renderBoxedText(tapRFIDlines, 3);
      if (!uuidRFID.isEmpty()) {
        const char* successRFIDLines[] = { "Berhasil TAP", "UUID RFID", uuidRFID.c_str() };
        menu.renderBoxedText(successRFIDLines, 3);
        delay(3000);
        const char* loadingAccountLines[] = { "Mendaftarkan", "Akun", "Mohon Tunggu" };
        menu.renderBoxedText(loadingAccountLines, 3);
        if (apiRegisterAccount()) {
          userCount++;
          preferences.begin("intan", false);
          preferences.putULong("userCount", userCount);
          preferences.end();
          menu.renderStatusScreen("Status Daftar", "Berhasil", true);
          delay(2000);
          const char* infoAccountLines[] = { "Email:", userEmail.c_str(), "Password:", userPassword.c_str() };
          menu.renderBoxedText(infoAccountLines, 4);
          delay(5000);
          menu.clearMenu(mainMenu, menu.end());
        } else {
          menu.renderStatusScreen("Status Daftar", "Gagal", false);
          delay(2000);
          menu.clearMenu(mainMenu, menu.end());
        }
        uuidRFID = "";
      }
      if (buttonOk.isPressed()) {
        menu.clearMenu(mainMenu, menu.end());
      }
    });

  menu.onSelect(mainMenu, "Test Sensor", []() {
    static uint32_t testSensorTimer;
    if (millis() - testSensorTimer >= 500) {
      testSensorTimer = millis();
      float bmi = float(weight / ((height / 100) * (height / 100)));
      bmi = (isinf(bmi) || isnan(bmi)) ? 0.0 : bmi;
      char bufferLine1[30], bufferLine2[30], bufferLine3[30];
      sprintf(bufferLine1, "Weight  : %6.2f Kg", weight);
      sprintf(bufferLine2, "Height  : %6.2f Cm", height);
      sprintf(bufferLine3, "BMI     : %6.2f", bmi);
      menu.renderInfoScreen("Test Sensor", String(bufferLine1).c_str(), String(bufferLine2).c_str(), String(bufferLine3).c_str());
    }
    if (buttonOk.isPressed()) {
      menu.clearMenu(mainMenu, menu.end());
    }
  });
  menu.showMenu(mainMenu);
}

void initDisplayCallback() {
  menu.clear();
  menu.drawRect(0, 0, 128, 64);
  menu.setColor(WHITE);
  menu.fillRect(0, 0, 128, 15);
  menu.setColor(BLACK);
  menu.setTextAlignment(TEXT_ALIGN_CENTER);
  menu.setFont(ArialMT_Plain_10);
  menu.drawString(64, 3, "ARI INTAN");
  menu.setColor(WHITE);
  menu.drawString(64, 25, "Loading...");
  menu.drawRect(24, 40, 80, 10);
  menu.fillRect(24, 40, 80, 10);
  menu.display();
  delay(1000);
}