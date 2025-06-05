void usbCommunicationTask(const String& dataRecv) {
  String data = dataRecv;
  String dataHeader = usbSerial.getStrData(dataRecv, 0, "#");
  String dataValue = usbSerial.getStrData(dataRecv, 1, "#");

  Serial.print("| dataRecv: ");
  Serial.print(dataRecv);
  Serial.println();

  if (isDigit(data[0]) || isDigit(data[1])) {
    // nums
  } else {
    dataHeader.toUpperCase();
    if (dataHeader == "R") ESP.restart();
    if (dataHeader == "HEIGHT_POLE") heightPole = dataValue.toFloat();  // HEIGHT_POLE#197.0

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
    if (dataHeader == "RESET_USER_COUNT") {
      userNumber = 0;
      preferences.begin("intan", false);
      preferences.putULong("userNumber", userNumber);
      preferences.end();
    }
  }
}