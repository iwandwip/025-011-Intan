void lcdMenuCallback() {
  static auto mainMenu = menu.createMenu(5, "Timbang", "Kalibrasi", "Tare", "Daftar", "Test Sensor");

  menu.onSelect(mainMenu, "Kalibrasi", []() {
    menu.renderCountdownScreen("Menunggu...", 75, true);
    if (buttonOk.isPressed()) {
      menu.clearMenu(mainMenu, menu.end());
    }
  });

  menu.onSelect(mainMenu, "Tare", []() {
    menu.renderStatusScreen("Koneksi WiFi", "Terhubung", true);
    if (buttonOk.isPressed()) {
      menu.clearMenu(mainMenu, menu.end());
    }
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
    menu.renderInfoScreen("Test Sensor", "Line 1", "Line 2", "Line 3");
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