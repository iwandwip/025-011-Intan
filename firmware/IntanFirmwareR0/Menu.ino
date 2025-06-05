void lcdMenuCallbackCustom() {
  // String beratStr = String(String(weight, 2) + " Kg");
  // const char* lines1[] = { "Berat Badan", beratStr.c_str() };
  // menu.renderBoxedText(lines1, 2);

  String tinggiStr = String(String(height, 2) + " cm");
  const char* lines1[] = { "Tinggi Badan", tinggiStr.c_str() };
  menu.renderBoxedText(lines1, 2);
}

void lcdMenuCallback() {
  if (measurementState == MEASUREMENT_IDLE) {
    const char* statusTimbangLines1[] = { "Silahkan Pilih", "Menu Ambil Data", "Pada Aplikasi Anda" };
    menu.renderBoxedText(statusTimbangLines1, 3);
    if (!uuidRFIDNow.isEmpty()) {
      firestoreGetDataForce = true;
      userAccShowBMI.rfid = uuidRFIDNow;
      userAccAdmin.rfid = uuidRFIDNow;
      for (int i = 1; i <= 90; i++) {
        menu.showLoadingBar("Loading", i);
      }
      while (measurementState == MEASUREMENT_IDLE) {
        ledRed.on();
      }
      menu.showLoadingBar("Loading", 100);
    }
  } else if (measurementState == MEASUREMENT_VALIDATION) {
    const char* statusTimbangLines2[] = { "Silahkan Tap", "Kartu RFID", "Anda" };
    menu.renderBoxedText(statusTimbangLines2, 3);
    if (!uuidRFIDNow.isEmpty()) {
      firestoreGetDataForce = true;
      if (uuidRFIDNow == userAccValid.rfid) {
        measurementState = MEASUREMENT_SUCCESS;
        userState = USER_GET_POLA_MAKAN;
        UserMeasurementData userEmptyData;
        userData = userEmptyData;
      }
    }
  } else if (measurementState == MEASUREMENT_SUCCESS) {
    if (userState == USER_GET_POLA_MAKAN) {
      menu.renderRadioMenu("Pola Makan", polaMakanOption, polaMakanNumOptions, polaMakanSelectedOption);
      if (buttonDown.isLongPressed(2000)) {
        buttonDown.resetState();
        backToMainMenu();
      }
      if (buttonOk.isLongPressed(2000)) {
        while (!buttonOk.getState()) {
          menu.renderModal(polaMakanOption[polaMakanSelectedOption], polaMakanExt[polaMakanSelectedOption], nullptr, false, false);
          buttonOk.update();
        }
        return;
      }
      if (buttonOk.isReleased()) {
        userData.polaMakan = polaMakanSelectedOption;
        userState = USER_GET_RESPON_ANAK;
      }
      if (buttonDown.isReleased()) {
        polaMakanSelectedOption = (polaMakanSelectedOption + 1) % polaMakanNumOptions;
      }
    } else if (userState == USER_GET_RESPON_ANAK) {
      menu.renderRadioMenu("Respon Anak", responAnakOption, responAnakNumOptions, responAnakSelectedOption);
      if (buttonDown.isLongPressed(2000)) {
        buttonDown.resetState();
        userState = USER_GET_POLA_MAKAN;
        return;
      }
      if (buttonOk.isLongPressed(2000)) {
        while (!buttonOk.getState()) {
          menu.renderModal(responAnakOption[responAnakSelectedOption], responAnakExt[responAnakSelectedOption], nullptr, false, false);
          buttonOk.update();
        }
        return;
      }
      if (buttonOk.isReleased()) {
        userData.responAnak = responAnakSelectedOption;
        userState = USER_GET_WEIGHT;
      }
      if (buttonDown.isReleased()) {
        responAnakSelectedOption = (responAnakSelectedOption + 1) % responAnakNumOptions;
      }
    } else if (userState == USER_GET_WEIGHT) {
      String beratBadanStr = String(weight) + " Kg";
      menu.renderInfoScreenCenter("Berat Badan", userAccValid.namaAnak.c_str(), userAccValid.gender.c_str(), beratBadanStr.c_str());
      if (buttonDown.isLongPressed(2000)) {
        buttonDown.resetState();
        userState = USER_GET_RESPON_ANAK;
        return;
      }
      if (buttonOk.isPressed()) {
        userData.weight = weight;
        userState = USER_GET_HEIGHT;
      }
    } else if (userState == USER_GET_HEIGHT) {
      String tinggiBadanStr = String(height) + " Cm";
      menu.renderInfoScreenCenter("Tinggi Badan", userAccValid.namaAnak.c_str(), userAccValid.gender.c_str(), tinggiBadanStr.c_str());
      if (buttonDown.isLongPressed(2000)) {
        buttonDown.resetState();
        userState = USER_GET_WEIGHT;
        return;
      }
      if (buttonOk.isPressed()) {
        userData.height = height;
        userData.bmi = calculateBMI(userData.weight, userData.height);
        userState = USER_VALIDATION_DATA;
      }
    } else if (userState == USER_VALIDATION_DATA) {
      String beratBadanStr = "Berat : " + String(userData.weight) + " Kg";
      String tinggiBadanStr = "Tinggi : " + String(userData.height) + " Cm";
      String bmiStr = "BMI   : " + getKategoriBMI(userData.bmi);
      menu.renderInfoScreenCenter("Data Anak", beratBadanStr.c_str(), tinggiBadanStr.c_str(), bmiStr.c_str());
      if (buttonDown.isLongPressed(2000)) {
        buttonDown.resetState();
        userState = USER_GET_HEIGHT;
        return;
      }
      if (buttonOk.isPressed()) {
        userState = USER_SEND_DATA;
      }
    } else if (userState == USER_SEND_DATA) {
      firestoreGetDataForce = true;
    }
  } else if (measurementState == MEASUREMENT_SHOW_BMI) {
    static auto showBMIMenu = menu.createMenu(4, "Timbang", "Kalibrasi", "Tare", "Kembali");

    menu.onSelect(showBMIMenu, "Timbang", []() {
      // static uint32_t measurementShowBMITimer;
      // if (millis() - measurementShowBMITimer >= 500) {
      //   measurementShowBMITimer = millis();
      bmi = calculateBMI(weight, height);
      String bmiStr = getKategoriBMI(bmi);
      char bufferLine1[30], bufferLine2[30];
      sprintf(bufferLine1, "Berat   : %6.2f Kg", weight);
      sprintf(bufferLine2, "Tinggi  : %6.2f Cm", height);
      menu.renderInfoScreen("Timbang", String(bufferLine1).c_str(), String(bufferLine2).c_str(), bmiStr.c_str());
      // }
      if (buttonOk.isPressed()) {
        menu.clearMenu(showBMIMenu, menu.end());
      }
    });

    menu.onSelect(showBMIMenu, "Kalibrasi", []() {
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
      menu.clearMenu(showBMIMenu, menu.end());
    });

    menu.onSelect(showBMIMenu, "Tare", []() {
      auto loadCell = sensor.getModule<HX711Sens>("lCell");
      loadCell->tare();
      menu.renderStatusScreen("Tare Loadcell", "Berhasil", true);
      delay(2000);
      menu.clearMenu(showBMIMenu, menu.end());
    });

    menu.onSelect(showBMIMenu, "Kembali", []() {
      backToMainMenu();
      for (int i = 1; i <= 100; i++) {
        menu.showLoadingBar("Loading", i);
      }
      menu.clearMenu(showBMIMenu, menu.end());
      return;
    });

    menu.showMenu(showBMIMenu);
  } else if (measurementState == MEASUREMENT_ADMIN) {
    static auto adminMenu = menu.createMenu(3, "Daftar Akun", "Lupa Akun", "Kembali");

    menu.onSelect(
      adminMenu, "Daftar Akun", []() {
        uuidRFIDNow = "";
      },
      []() {
        const char* tapRFIDlines[] = { "Silahkan Tap", "Kartu RFID", "Anda" };
        menu.renderBoxedText(tapRFIDlines, 3);
        if (!uuidRFIDNow.isEmpty()) {
          const char* successRFIDLines[] = { "Berhasil TAP", "UUID RFID", uuidRFIDNow.c_str() };
          menu.renderBoxedText(successRFIDLines, 3);
          delay(3000);
          const char* loadingAccountLines[] = { "Mendaftarkan", "Akun", "Mohon Tunggu" };
          menu.renderBoxedText(loadingAccountLines, 3);
          if (apiRegisterAccount()) {
            userNumber++;
            preferences.begin("intan", false);
            preferences.putULong("userNumber", userNumber);
            preferences.end();
            menu.renderStatusScreen("Status Daftar", "Berhasil", true);
            delay(2000);
            const char* infoAccountLines[] = { "Email:", userAccRegister.email.c_str(), "Password:", userAccRegister.password.c_str() };
            menu.renderBoxedText(infoAccountLines, 4);
            while (true) {
              if (buttonOk.isPressed()) {
                menu.clearMenu(adminMenu, menu.end());
                break;
              }
              buttonOk.update();
            }
          } else {
            menu.renderStatusScreen("Status Daftar", "Gagal", false);
            delay(2000);
            menu.clearMenu(adminMenu, menu.end());
          }
          uuidRFIDNow = "";
        }
        if (buttonOk.isPressed()) {
          menu.clearMenu(adminMenu, menu.end());
        }
      });

    menu.onSelect(adminMenu, "Lupa Akun", []() {
      if (!uuidRFIDNow.isEmpty()) {
        userAccAdmin.rfid = uuidRFIDNow;
        adminState = ADMIN_FORGOT_ACCOUNT;
      }
      const char* testRFIDLines1[] = { "Tap Your RFID", userAccAdmin.rfid.c_str(), userAccAdmin.email.c_str(), userAccAdmin.password.c_str() };
      menu.renderBoxedText(testRFIDLines1, 4);
      if (buttonDown.isPressed()) {
        UserAcc UserAccEmpty;
        userAccAdmin = UserAccEmpty;
        adminState = ADMIN_IDLE;
      }
      if (buttonOk.isPressed()) {
        menu.clearMenu(adminMenu, menu.end());
      }
    });

    menu.onSelect(adminMenu, "Kembali", []() {
      backToMainMenu();
      menu.clearMenu(adminMenu, menu.end());
      return;
    });

    menu.showMenu(adminMenu);
  }
}

void backToMainMenu() {
  measurementState = MEASUREMENT_IDLE;
  adminState = ADMIN_IDLE;
  userState = USER_IDLE;
  firestoreGetDataForce = true;
  uuidRFIDNow = "";
  UserAcc UserAccEmpty;
  userAccValid = UserAccEmpty;
  userAccShowBMI = UserAccEmpty;
  userAccAdmin = UserAccEmpty;
  userAccRegister = UserAccEmpty;
  UserMeasurementData userDataEmpty;
  userData = userDataEmpty;
  buzzer.toggleInit(100, 2);
  // delay(3000);
  for (int i = 1; i <= 100; i++) {
    menu.showLoadingBar("Loading", i);
  }
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

String getKategoriBMI(float bmiAnak) {
  if (bmiAnak < 18.5) {
    return "Kurang";
  } else if (bmiAnak >= 18.5 && bmiAnak < 24.9) {
    return "Ideal";
  } else if (bmiAnak >= 25 && bmiAnak < 29.9) {
    return "Lebih";
  } else {
    return "Obesitas";
  }
}

String getMeasurementStr() {
  String measurementStr;
  if (measurementState == MEASUREMENT_IDLE) measurementStr = "MEASUREMENT_IDLE";
  if (measurementState == MEASUREMENT_VALIDATION) measurementStr = "MEASUREMENT_VALIDATION";
  if (measurementState == MEASUREMENT_SUCCESS) measurementStr = "MEASUREMENT_SUCCESS";
  if (measurementState == MEASUREMENT_SHOW_BMI) measurementStr = "MEASUREMENT_SHOW_BMI";
  if (measurementState == MEASUREMENT_ADMIN) measurementStr = "MEASUREMENT_ADMIN";
  return measurementStr;
}