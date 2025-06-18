KNN nutritionKNN(5, 8, 120);

void initKNNMethods() {
  Serial.println("Initializing KNN Nutrition Status Model...");
  nutritionKNN.setDistanceMetric(EUCLIDEAN);
  nutritionKNN.setWeightedVoting(true);
  nutritionKNN.enableNormalization(true);
  addNutritionTrainingData();
  Serial.println("KNN Model initialized with training data");
}

String getNutritionStatus(float weight, float height, int ageYears, int ageMonths, String gender, String eatingPattern, String childResponse) {
  Gender genderEnum = encodeGender(gender);
  PolaMakan eatingPatternEnum = encodeEatingPattern(eatingPattern);
  ResponAnak childResponseEnum = encodeChildResponse(childResponse);
  float imt = calculateIMT(weight, height);
  float features[] = {
    (float)ageYears,
    (float)ageMonths,
    (float)genderEnum,
    weight,
    height,
    imt,
    (float)eatingPatternEnum,
    (float)childResponseEnum
  };
  const char* prediction = nutritionKNN.predict(features);
  float confidence = nutritionKNN.getPredictionConfidence(features);
  Serial.print("KNN Prediction: ");
  Serial.print(prediction);
  Serial.print(" (confidence: ");
  Serial.print(confidence * 100.0);
  Serial.println("%)");
  return String(prediction);
}

void addNutritionTrainingData() {
  Serial.println("Adding nutrition training data from dataset.csv in exact row order...");
  addTrainingDataPoint(6, 5, PEREMPUAN, 29.6, 110.1, CUKUP, PASIF, "obesitas");
  addTrainingDataPoint(5, 0, PEREMPUAN, 20.2, 113.9, KURANG, PASIF, "gizi baik");
  addTrainingDataPoint(7, 0, PEREMPUAN, 25.8, 110.4, BERLEBIH, PASIF, "obesitas");
  addTrainingDataPoint(6, 6, PEREMPUAN, 28.8, 113.9, KURANG, SEDANG, "obesitas");
  addTrainingDataPoint(6, 9, PEREMPUAN, 26.8, 109.9, CUKUP, SEDANG, "obesitas");
  addTrainingDataPoint(6, 3, PEREMPUAN, 23.2, 120.8, CUKUP, PASIF, "gizi baik");
  addTrainingDataPoint(6, 9, PEREMPUAN, 26.1, 113.9, BERLEBIH, SEDANG, "obesitas");
  addTrainingDataPoint(5, 8, PEREMPUAN, 27.2, 129.7, KURANG, AKTIF, "gizi baik");
  addTrainingDataPoint(5, 11, PEREMPUAN, 32.4, 126.5, BERLEBIH, PASIF, "obesitas");
  addTrainingDataPoint(6, 7, LAKI_LAKI, 15.5, 111.5, KURANG, SEDANG, "gizi buruk");
  addTrainingDataPoint(6, 3, LAKI_LAKI, 15.0, 108.1, CUKUP, PASIF, "gizi buruk");
  addTrainingDataPoint(6, 4, LAKI_LAKI, 30.1, 117.8, BERLEBIH, SEDANG, "obesitas");
  addTrainingDataPoint(6, 0, PEREMPUAN, 25.2, 129.5, BERLEBIH, PASIF, "gizi baik");
  addTrainingDataPoint(6, 1, LAKI_LAKI, 23.7, 105.5, KURANG, AKTIF, "obesitas");
  addTrainingDataPoint(5, 10, PEREMPUAN, 32.7, 112.2, CUKUP, PASIF, "obesitas");
  addTrainingDataPoint(7, 9, LAKI_LAKI, 21.1, 117.0, CUKUP, SEDANG, "gizi baik");
  addTrainingDataPoint(6, 5, LAKI_LAKI, 17.1, 105.9, KURANG, SEDANG, "gizi baik");
  addTrainingDataPoint(6, 11, PEREMPUAN, 16.9, 120.6, BERLEBIH, PASIF, "gizi buruk");
  addTrainingDataPoint(5, 8, LAKI_LAKI, 23.5, 100.8, BERLEBIH, AKTIF, "obesitas");
  addTrainingDataPoint(6, 9, PEREMPUAN, 17.1, 121.2, KURANG, PASIF, "gizi buruk");
  addTrainingDataPoint(6, 10, PEREMPUAN, 30.7, 104.7, BERLEBIH, AKTIF, "obesitas");
  addTrainingDataPoint(5, 5, LAKI_LAKI, 31.7, 111.2, KURANG, AKTIF, "obesitas");
  addTrainingDataPoint(6, 5, PEREMPUAN, 14.3, 127.5, BERLEBIH, SEDANG, "gizi buruk");
  addTrainingDataPoint(5, 10, PEREMPUAN, 26.5, 107.4, KURANG, AKTIF, "obesitas");
  addTrainingDataPoint(7, 0, LAKI_LAKI, 32.0, 109.0, BERLEBIH, SEDANG, "obesitas");
  addTrainingDataPoint(6, 4, PEREMPUAN, 30.5, 125.9, KURANG, AKTIF, "obesitas");
  addTrainingDataPoint(7, 6, LAKI_LAKI, 21.1, 103.4, CUKUP, PASIF, "obesitas");
  addTrainingDataPoint(5, 11, PEREMPUAN, 16.9, 129.8, BERLEBIH, PASIF, "gizi buruk");
  addTrainingDataPoint(6, 1, LAKI_LAKI, 20.5, 124.4, BERLEBIH, SEDANG, "gizi kurang");
  addTrainingDataPoint(6, 9, PEREMPUAN, 25.7, 104.0, BERLEBIH, AKTIF, "obesitas");
  addTrainingDataPoint(6, 4, LAKI_LAKI, 20.4, 127.6, KURANG, AKTIF, "gizi buruk");
  addTrainingDataPoint(5, 6, PEREMPUAN, 32.0, 111.9, CUKUP, PASIF, "obesitas");
  addTrainingDataPoint(7, 4, LAKI_LAKI, 31.5, 107.1, BERLEBIH, SEDANG, "obesitas");
  addTrainingDataPoint(7, 4, LAKI_LAKI, 29.0, 129.0, KURANG, PASIF, "overweight");
  addTrainingDataPoint(6, 11, LAKI_LAKI, 26.3, 102.9, BERLEBIH, SEDANG, "obesitas");
  addTrainingDataPoint(6, 4, PEREMPUAN, 14.8, 110.7, BERLEBIH, SEDANG, "gizi buruk");
  addTrainingDataPoint(7, 3, PEREMPUAN, 27.9, 100.9, KURANG, AKTIF, "obesitas");
  addTrainingDataPoint(6, 4, PEREMPUAN, 33.1, 101.7, KURANG, SEDANG, "obesitas");
  addTrainingDataPoint(7, 4, LAKI_LAKI, 23.7, 118.0, BERLEBIH, AKTIF, "overweight");
  addTrainingDataPoint(6, 3, PEREMPUAN, 26.2, 128.2, BERLEBIH, AKTIF, "gizi baik");
  addTrainingDataPoint(5, 5, LAKI_LAKI, 32.0, 118.3, BERLEBIH, AKTIF, "obesitas");
  addTrainingDataPoint(6, 11, LAKI_LAKI, 30.0, 112.4, BERLEBIH, AKTIF, "obesitas");
  addTrainingDataPoint(7, 9, PEREMPUAN, 30.5, 106.7, CUKUP, PASIF, "obesitas");
  addTrainingDataPoint(5, 10, LAKI_LAKI, 34.6, 111.7, BERLEBIH, PASIF, "obesitas");
  addTrainingDataPoint(6, 3, PEREMPUAN, 20.2, 116.1, KURANG, AKTIF, "gizi baik");
  addTrainingDataPoint(6, 4, PEREMPUAN, 30.4, 108.9, BERLEBIH, SEDANG, "obesitas");
  addTrainingDataPoint(5, 2, LAKI_LAKI, 21.8, 127.3, KURANG, PASIF, "gizi kurang");
  addTrainingDataPoint(6, 6, LAKI_LAKI, 26.2, 118.5, CUKUP, PASIF, "overweight");
  addTrainingDataPoint(7, 2, PEREMPUAN, 33.2, 124.7, CUKUP, SEDANG, "obesitas");
  addTrainingDataPoint(6, 11, LAKI_LAKI, 32.4, 114.2, BERLEBIH, AKTIF, "obesitas");
  addTrainingDataPoint(7, 2, PEREMPUAN, 25.1, 123.3, BERLEBIH, SEDANG, "gizi baik");
  addTrainingDataPoint(7, 11, LAKI_LAKI, 15.5, 122.1, BERLEBIH, PASIF, "gizi buruk");
  addTrainingDataPoint(5, 4, PEREMPUAN, 19.2, 129.0, KURANG, SEDANG, "gizi buruk");
  addTrainingDataPoint(7, 3, PEREMPUAN, 27.9, 102.6, KURANG, PASIF, "obesitas");
  addTrainingDataPoint(6, 0, LAKI_LAKI, 31.0, 100.8, CUKUP, AKTIF, "obesitas");
  addTrainingDataPoint(7, 2, LAKI_LAKI, 30.9, 103.4, CUKUP, SEDANG, "obesitas");
  addTrainingDataPoint(5, 5, LAKI_LAKI, 29.1, 127.3, BERLEBIH, AKTIF, "overweight");
  addTrainingDataPoint(7, 0, PEREMPUAN, 22.6, 108.5, BERLEBIH, PASIF, "obesitas");
  addTrainingDataPoint(7, 7, LAKI_LAKI, 29.3, 105.2, CUKUP, SEDANG, "obesitas");
  addTrainingDataPoint(5, 3, PEREMPUAN, 21.7, 125.6, BERLEBIH, AKTIF, "gizi kurang");
  addTrainingDataPoint(6, 3, PEREMPUAN, 33.7, 107.8, BERLEBIH, SEDANG, "obesitas");
  addTrainingDataPoint(5, 9, PEREMPUAN, 17.2, 109.4, BERLEBIH, SEDANG, "gizi kurang");
  addTrainingDataPoint(7, 5, LAKI_LAKI, 22.7, 121.5, BERLEBIH, PASIF, "gizi baik");
  addTrainingDataPoint(6, 6, PEREMPUAN, 15.1, 122.0, CUKUP, PASIF, "gizi buruk");
  addTrainingDataPoint(5, 10, LAKI_LAKI, 19.9, 106.7, KURANG, SEDANG, "overweight");
  addTrainingDataPoint(5, 11, LAKI_LAKI, 27.5, 123.6, CUKUP, SEDANG, "overweight");
  addTrainingDataPoint(5, 0, LAKI_LAKI, 21.4, 119.7, KURANG, AKTIF, "gizi baik");
  addTrainingDataPoint(6, 6, LAKI_LAKI, 31.6, 124.4, CUKUP, SEDANG, "obesitas");
  addTrainingDataPoint(7, 5, PEREMPUAN, 34.5, 113.3, KURANG, AKTIF, "obesitas");
  addTrainingDataPoint(6, 7, PEREMPUAN, 27.4, 121.0, BERLEBIH, AKTIF, "overweight");
  addTrainingDataPoint(6, 10, PEREMPUAN, 19.6, 129.3, CUKUP, AKTIF, "gizi buruk");
  addTrainingDataPoint(6, 10, LAKI_LAKI, 32.9, 108.0, BERLEBIH, PASIF, "obesitas");
  addTrainingDataPoint(7, 5, PEREMPUAN, 24.8, 127.3, CUKUP, AKTIF, "gizi baik");
  addTrainingDataPoint(5, 2, PEREMPUAN, 25.8, 117.9, CUKUP, SEDANG, "overweight");
  addTrainingDataPoint(7, 2, LAKI_LAKI, 15.5, 116.9, KURANG, PASIF, "gizi buruk");
  addTrainingDataPoint(5, 1, LAKI_LAKI, 33.5, 106.5, BERLEBIH, PASIF, "obesitas");
  addTrainingDataPoint(7, 0, LAKI_LAKI, 15.5, 127.0, KURANG, AKTIF, "gizi buruk");
  addTrainingDataPoint(5, 0, LAKI_LAKI, 14.2, 107.0, KURANG, PASIF, "gizi buruk");
  addTrainingDataPoint(7, 9, PEREMPUAN, 33.2, 127.8, CUKUP, PASIF, "obesitas");
  addTrainingDataPoint(5, 3, LAKI_LAKI, 25.2, 116.0, KURANG, PASIF, "overweight");
  addTrainingDataPoint(6, 0, LAKI_LAKI, 19.2, 109.0, KURANG, SEDANG, "gizi baik");
  addTrainingDataPoint(6, 4, LAKI_LAKI, 18.8, 120.2, KURANG, SEDANG, "gizi kurang");
  addTrainingDataPoint(7, 0, LAKI_LAKI, 19.4, 109.3, KURANG, SEDANG, "gizi baik");
  addTrainingDataPoint(6, 6, LAKI_LAKI, 29.2, 121.1, CUKUP, SEDANG, "obesitas");
  addTrainingDataPoint(7, 9, LAKI_LAKI, 33.1, 103.9, CUKUP, PASIF, "obesitas");
  addTrainingDataPoint(5, 3, LAKI_LAKI, 19.9, 108.2, KURANG, SEDANG, "overweight");
  addTrainingDataPoint(5, 9, PEREMPUAN, 26.5, 123.6, BERLEBIH, PASIF, "overweight");
  addTrainingDataPoint(6, 11, LAKI_LAKI, 20.0, 124.1, CUKUP, PASIF, "gizi kurang");
  addTrainingDataPoint(6, 7, LAKI_LAKI, 19.9, 103.2, CUKUP, PASIF, "overweight");
  addTrainingDataPoint(5, 8, PEREMPUAN, 26.4, 126.4, BERLEBIH, PASIF, "gizi baik");
  addTrainingDataPoint(7, 8, LAKI_LAKI, 28.5, 108.1, BERLEBIH, PASIF, "obesitas");
  addTrainingDataPoint(7, 8, LAKI_LAKI, 15.0, 101.2, BERLEBIH, PASIF, "gizi baik");
  addTrainingDataPoint(7, 11, LAKI_LAKI, 26.2, 119.9, KURANG, SEDANG, "overweight");
  addTrainingDataPoint(6, 9, LAKI_LAKI, 21.0, 123.2, CUKUP, AKTIF, "gizi kurang");
  addTrainingDataPoint(5, 7, LAKI_LAKI, 25.2, 115.3, KURANG, SEDANG, "obesitas");
  addTrainingDataPoint(7, 8, LAKI_LAKI, 17.9, 123.3, CUKUP, AKTIF, "gizi buruk");
  addTrainingDataPoint(6, 4, PEREMPUAN, 21.0, 126.5, BERLEBIH, SEDANG, "gizi buruk");
  addTrainingDataPoint(6, 7, LAKI_LAKI, 25.4, 120.4, KURANG, SEDANG, "overweight");
  addTrainingDataPoint(5, 10, PEREMPUAN, 30.2, 125.6, KURANG, SEDANG, "obesitas");
  addTrainingDataPoint(6, 6, LAKI_LAKI, 16.3, 106.5, CUKUP, PASIF, "gizi kurang");
  Serial.print("Total training data added: ");
  Serial.println(nutritionKNN.getDataCount());
}

void addTrainingDataPoint(int ageYears, int ageMonths, Gender gender, float weight, float height, PolaMakan eatingPattern, ResponAnak childResponse, const char* statusGizi) {
  float imt = calculateIMT(weight, height);
  float features[] = {
    (float)ageYears,
    (float)ageMonths,
    (float)gender,
    weight,
    height,
    imt,
    (float)eatingPattern,
    (float)childResponse
  };
  nutritionKNN.addTrainingData(statusGizi, features);
}

float calculateIMT(float weight, float height) {
  if (height <= 0) return 0.0;
  float heightInMeters = height / 100.0;
  return weight / (heightInMeters * heightInMeters);
}

Gender encodeGender(String gender) {
  if (gender.equals("male") || gender.equals("laki-laki") || gender.equals("Laki-laki") || gender.equals("L")) {
    return LAKI_LAKI;
  }
  return PEREMPUAN;
}

PolaMakan encodeEatingPattern(String pattern) {
  if (pattern.equals("kurang") || pattern.equals("Kurang")) return KURANG;
  if (pattern.equals("cukup") || pattern.equals("Cukup")) return CUKUP;
  if (pattern.equals("berlebih") || pattern.equals("Berlebih")) return BERLEBIH;
  return CUKUP;
}

ResponAnak encodeChildResponse(String response) {
  if (response.equals("pasif") || response.equals("Pasif")) return PASIF;
  if (response.equals("sedang") || response.equals("Sedang")) return SEDANG;
  if (response.equals("aktif") || response.equals("Aktif")) return AKTIF;
  return SEDANG;
}

StatusGizi encodeNutritionStatus(String status) {
  if (status.equals("gizi buruk") || status.equals("Gizi Buruk")) return GIZI_BURUK;
  if (status.equals("gizi kurang") || status.equals("Gizi Kurang")) return GIZI_KURANG;
  if (status.equals("gizi baik") || status.equals("Gizi Baik")) return GIZI_BAIK;
  if (status.equals("overweight") || status.equals("Overweight")) return OVERWEIGHT;
  if (status.equals("obesitas") || status.equals("Obesitas")) return OBESITAS;
  return GIZI_BAIK;
}

String nutritionStatusToString(StatusGizi status) {
  switch (status) {
    case GIZI_BURUK: return "gizi buruk";
    case GIZI_KURANG: return "gizi kurang";
    case GIZI_BAIK: return "gizi baik";
    case OVERWEIGHT: return "overweight";
    case OBESITAS: return "obesitas";
    default: return "gizi baik";
  }
}