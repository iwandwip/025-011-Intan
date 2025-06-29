void usbCommunicationCallback(const String& dataRecv) {
  String dataHeader = usbSerial.getString(dataRecv, 0, "#");
  String dataValue = usbSerial.getString(dataRecv, 1, "#");
  dataHeader.toUpperCase();

  debug.startPrint(LOG_COMS);
  debug.continuePrint("dataRecv", dataRecv, LOG_COMS);
  debug.endPrint(LOG_COMS, true);

  if (dataHeader == "RST") ESP.restart();

  if (dataHeader == "LOG_INFO") debug.isLogLevelEnabled(LOG_INFO) ? debug.disableLogLevel(LOG_INFO) : debug.enableLogLevel(LOG_INFO);
  if (dataHeader == "LOG_SENSOR") debug.isLogLevelEnabled(LOG_SENSOR) ? debug.disableLogLevel(LOG_SENSOR) : debug.enableLogLevel(LOG_SENSOR);
  if (dataHeader == "LOG_COMS") debug.isLogLevelEnabled(LOG_COMS) ? debug.disableLogLevel(LOG_COMS) : debug.enableLogLevel(LOG_COMS);

  if (dataHeader == "CAL") performLoadCellCalibration();
  if (dataHeader == "TARE") performLoadCellTare();

  // Firebase RTDB
  if (dataHeader == "RTDB_SET_VALUE") firebaseRTDBState = RTDB_SET_VALUE;
  if (dataHeader == "RTDB_SET_VALUE_JSON") firebaseRTDBState = RTDB_SET_VALUE_JSON;
  if (dataHeader == "RTDB_SET_VALUE_PERIODIC") firebaseRTDBState = RTDB_SET_VALUE_PERIODIC;
  if (dataHeader == "RTDB_GET_VALUE") firebaseRTDBState = RTDB_GET_VALUE;
  if (dataHeader == "RTDB_GET_VALUE_JSON") firebaseRTDBState = RTDB_GET_VALUE_JSON;
  if (dataHeader == "RTDB_GET_VALUE_PERIODIC") firebaseRTDBState = RTDB_GET_VALUE_PERIODIC;

  // Firebase Firestore
  if (dataHeader == "FIRESTORE_CREATE") firebaseFirestoreState = FIRESTORE_CREATE;
  if (dataHeader == "FIRESTORE_READ") firebaseFirestoreState = FIRESTORE_READ;
  if (dataHeader == "FIRESTORE_UPDATE") firebaseFirestoreState = FIRESTORE_UPDATE;
  if (dataHeader == "FIRESTORE_DELETE") firebaseFirestoreState = FIRESTORE_DELETE;

  // Firebase Mesagging
  if (dataHeader == "MESSAGING_SEND") firebaseMessagingState = MESSAGING_SEND;

  if (dataHeader == "KNN") {
    dataValue.replace(" ", "");
    int commaIndex1 = dataValue.indexOf(',');
    int commaIndex2 = dataValue.indexOf(',', commaIndex1 + 1);
    int commaIndex3 = dataValue.indexOf(',', commaIndex2 + 1);
    int commaIndex4 = dataValue.indexOf(',', commaIndex3 + 1);
    int commaIndex5 = dataValue.indexOf(',', commaIndex4 + 1);
    int commaIndex6 = dataValue.indexOf(',', commaIndex5 + 1);
    if (commaIndex1 != -1 && commaIndex2 != -1 && commaIndex3 != -1 && commaIndex4 != -1 && commaIndex5 != -1 && commaIndex6 != -1) {
      int ageYears = dataValue.substring(0, commaIndex1).toInt();
      int ageMonths = dataValue.substring(commaIndex1 + 1, commaIndex2).toInt();
      String genderInput = dataValue.substring(commaIndex2 + 1, commaIndex3);
      float weight = dataValue.substring(commaIndex3 + 1, commaIndex4).toFloat();
      float height = dataValue.substring(commaIndex4 + 1, commaIndex5).toFloat();
      String eatingPatternInput = dataValue.substring(commaIndex5 + 1, commaIndex6);
      String childResponseInput = dataValue.substring(commaIndex6 + 1);
      String genderStr = "";
      if (genderInput == "PEREMPUAN") {
        genderStr = "Perempuan";
      } else if (genderInput == "LAKI_LAKI") {
        genderStr = "Laki-laki";
      } else {
        Serial.println("Error: Invalid gender. Use PEREMPUAN or LAKI_LAKI");
        return;
      }
      String eatingPatternStr = "";
      if (eatingPatternInput == "KURANG") {
        eatingPatternStr = "Kurang";
      } else if (eatingPatternInput == "CUKUP") {
        eatingPatternStr = "Cukup";
      } else if (eatingPatternInput == "BERLEBIH") {
        eatingPatternStr = "Berlebih";
      } else {
        Serial.println("Error: Invalid eating pattern. Use KURANG, CUKUP, or BERLEBIH");
        return;
      }
      String childResponseStr = "";
      if (childResponseInput == "PASIF") {
        childResponseStr = "Pasif";
      } else if (childResponseInput == "SEDANG") {
        childResponseStr = "Sedang";
      } else if (childResponseInput == "AKTIF") {
        childResponseStr = "Aktif";
      } else {
        Serial.println("Error: Invalid child response. Use PASIF, SEDANG, or AKTIF");
        return;
      }
      String nutritionStatus = getNutritionStatus(weight, height, ageYears, ageMonths, genderStr, eatingPatternStr, childResponseStr);
      Serial.println("=== KNN NUTRITION STATUS PREDICTION ===");
      Serial.printf("Input: Usia=%d tahun %d bulan, Gender=%s, Berat=%.2f kg, Tinggi=%.2f cm\n", ageYears, ageMonths, genderStr.c_str(), weight, height);
      Serial.printf("       Pola Makan=%s, Respon Anak=%s\n", eatingPatternStr.c_str(), childResponseStr.c_str());
      Serial.printf("Prediction: %s\n", nutritionStatus.c_str());
      Serial.println("====================================");
    } else {
      Serial.println("Error: Invalid KNN format. Use: KNN#ageYears, ageMonths, gender, weight, height, eatingPattern, childResponse");
      Serial.println("Example: KNN#6, 6, LAKI_LAKI, 16.3, 106.5, CUKUP, PASIF");
      Serial.println("Gender: PEREMPUAN or LAKI_LAKI");
      Serial.println("Pola Makan: KURANG, CUKUP, or BERLEBIH");
      Serial.println("Respon Anak: PASIF, SEDANG, or AKTIF");
    }
  }
}

void performLoadCellCalibration() {
  auto loadCell = sensor.getModule<HX711Sens>("loadcell");
  Serial.println("KALIBRASI LEPAS SEMUA OBJEK DARI TIMBANGAN");
  loadCell->setScaleDelay(5000);
  Serial.println("KALIBRASI LETAKKAN OBJEK 296 G DI TIMBANGAN");
  loadCell->tareDelay(5000);
  float units = loadCell->getUnits(10);
  float calibrationFactor = loadCell->getCalibrateFactor(units, 296);
  Serial.println("Calibration factor: " + String(calibrationFactor));
  loadCell->setScale(calibrationFactor);
  Serial.println("KALIBRASI BERHASIL");
  delay(5000);
  loadCell->tare();
}

void performLoadCellTare() {
  auto loadCell = sensor.getModule<HX711Sens>("loadcell");
  loadCell->tare();
  Serial.println("TARE BERHASIL");
  delay(2000);
}