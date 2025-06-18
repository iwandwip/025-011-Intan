// KNN instance untuk klasifikasi status gizi
// Features (CSV order): [age_years, age_months, gender, weight, height, imt, eating_pattern, child_response]
KNN nutritionKNN(5, 8, 120);  // k=5, 8 fitur (tambah IMT), max 120 data training (100 data dari CSV)

void initKNNMethods() {
  Serial.println("Initializing KNN Nutrition Status Model...");

  // Configure KNN
  nutritionKNN.setDistanceMetric(EUCLIDEAN);
  nutritionKNN.setWeightedVoting(true);
  nutritionKNN.enableNormalization(true);

  // Add training data based on BMI categories and nutrition guidelines
  addNutritionTrainingData();

  Serial.println("KNN Model initialized with training data");
}

String getNutritionStatus(float weight, float height, int ageYears, int ageMonths, String gender, String eatingPattern, String childResponse) {
  // Encode categorical data using enums
  Gender genderEnum = encodeGender(gender);
  PolaMakan eatingPatternEnum = encodeEatingPattern(eatingPattern);
  ResponAnak childResponseEnum = encodeChildResponse(childResponse);

  // Calculate IMT (BMI)
  float imt = calculateIMT(weight, height);

  // Prepare feature array (matching CSV column order)
  float features[] = {
    (float)ageYears,           // 0: Usia (tahun)
    (float)ageMonths,          // 1: Usia (bulan)
    (float)genderEnum,         // 2: Jenis Kelamin (PEREMPUAN=0, LAKI_LAKI=1)
    weight,                    // 3: Berat Badan (kg)
    height,                    // 4: Tinggi Badan (cm)
    imt,                       // 5: IMT (calculated)
    (float)eatingPatternEnum,  // 6: Pola Makan (KURANG=0, CUKUP=1, BERLEBIH=2)
    (float)childResponseEnum   // 7: Respon Anak (PASIF=0, SEDANG=1, AKTIF=2)
  };

  // Get prediction
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

  // CSV Format: Usia(tahun), Usia(bulan), Jenis Kelamin, Berat(kg), Tinggi(cm), IMT, Pola Makan, Respon Anak, Status Gizi
  // Function: addTrainingDataPoint(ageYears, ageMonths, gender, weight, height, eatingPattern, childResponse, statusGizi)

  // Row 2: 6,5,Perempuan,29.6,110.1,24.4,Cukup,Pasif,Obesitas
  addTrainingDataPoint(6, 5, PEREMPUAN, 29.6, 110.1, CUKUP, PASIF, "obesitas");
  // Row 3: 5,0,Perempuan,20.2,113.9,15.6,Kurang,Pasif,Gizi Baik
  addTrainingDataPoint(5, 0, PEREMPUAN, 20.2, 113.9, KURANG, PASIF, "gizi baik");
  // Row 4: 7,0,Perempuan,25.8,110.4,21.2,Berlebih,Pasif,Obesitas
  addTrainingDataPoint(7, 0, PEREMPUAN, 25.8, 110.4, BERLEBIH, PASIF, "obesitas");
  // Row 5: 6,6,Perempuan,28.8,113.9,22.2,Kurang,Sedang,Obesitas
  addTrainingDataPoint(6, 6, PEREMPUAN, 28.8, 113.9, KURANG, SEDANG, "obesitas");
  // Row 6: 6,9,Perempuan,26.8,109.9,22.2,Cukup,Sedang,Obesitas
  addTrainingDataPoint(6, 9, PEREMPUAN, 26.8, 109.9, CUKUP, SEDANG, "obesitas");
  // Row 7: 6,3,Perempuan,23.2,120.8,15.9,Cukup,Pasif,Gizi Baik
  addTrainingDataPoint(6, 3, PEREMPUAN, 23.2, 120.8, CUKUP, PASIF, "gizi baik");
  // Row 8: 6,9,Perempuan,26.1,113.9,20.1,Berlebih,Sedang,Obesitas
  addTrainingDataPoint(6, 9, PEREMPUAN, 26.1, 113.9, BERLEBIH, SEDANG, "obesitas");
  // Row 9: 5,8,Perempuan,27.2,129.7,16.2,Kurang,Aktif,Gizi Baik
  addTrainingDataPoint(5, 8, PEREMPUAN, 27.2, 129.7, KURANG, AKTIF, "gizi baik");
  // Row 10: 5,11,Perempuan,32.4,126.5,20.2,Berlebih,Pasif,Obesitas
  addTrainingDataPoint(5, 11, PEREMPUAN, 32.4, 126.5, BERLEBIH, PASIF, "obesitas");
  // Row 11: 6,7,Laki-laki,15.5,111.5,12.5,Kurang,Sedang,Gizi Buruk
  addTrainingDataPoint(6, 7, LAKI_LAKI, 15.5, 111.5, KURANG, SEDANG, "gizi buruk");
  // Row 12: 6,3,Laki-laki,15,108.1,12.8,Cukup,Pasif,Gizi Buruk
  addTrainingDataPoint(6, 3, LAKI_LAKI, 15.0, 108.1, CUKUP, PASIF, "gizi buruk");
  // Row 13: 6,4,Laki-laki,30.1,117.8,21.7,Berlebih,Sedang,Obesitas
  addTrainingDataPoint(6, 4, LAKI_LAKI, 30.1, 117.8, BERLEBIH, SEDANG, "obesitas");
  // Row 14: 6,0,Perempuan,25.2,129.5,15,Berlebih,Pasif,Gizi Baik
  addTrainingDataPoint(6, 0, PEREMPUAN, 25.2, 129.5, BERLEBIH, PASIF, "gizi baik");
  // Row 15: 6,1,Laki-laki,23.7,105.5,21.3,Kurang,Aktif,Obesitas
  addTrainingDataPoint(6, 1, LAKI_LAKI, 23.7, 105.5, KURANG, AKTIF, "obesitas");
  // Row 16: 5,10,Perempuan,32.7,112.2,26,Cukup,Pasif,Obesitas
  addTrainingDataPoint(5, 10, PEREMPUAN, 32.7, 112.2, CUKUP, PASIF, "obesitas");
  // Row 17: 7,9,Laki-laki,21.1,117,15.4,Cukup,Sedang,Gizi Baik
  addTrainingDataPoint(7, 9, LAKI_LAKI, 21.1, 117.0, CUKUP, SEDANG, "gizi baik");
  // Row 18: 6,5,Laki-laki,17.1,105.9,15.2,Kurang,Sedang,Gizi Baik
  addTrainingDataPoint(6, 5, LAKI_LAKI, 17.1, 105.9, KURANG, SEDANG, "gizi baik");
  // Row 19: 6,11,Perempuan,16.9,120.6,11.6,Berlebih,Pasif,Gizi Buruk
  addTrainingDataPoint(6, 11, PEREMPUAN, 16.9, 120.6, BERLEBIH, PASIF, "gizi buruk");
  // Row 20: 5,8,Laki-laki,23.5,100.8,23.1,Berlebih,Aktif,Obesitas
  addTrainingDataPoint(5, 8, LAKI_LAKI, 23.5, 100.8, BERLEBIH, AKTIF, "obesitas");
  // Row 21: 6,9,Perempuan,17.1,121.2,11.6,Kurang,Pasif,Gizi Buruk
  addTrainingDataPoint(6, 9, PEREMPUAN, 17.1, 121.2, KURANG, PASIF, "gizi buruk");
  // Row 22: 6,10,Perempuan,30.7,104.7,28,Berlebih,Aktif,Obesitas
  addTrainingDataPoint(6, 10, PEREMPUAN, 30.7, 104.7, BERLEBIH, AKTIF, "obesitas");
  // Row 23: 5,5,Laki-laki,31.7,111.2,25.6,Kurang,Aktif,Obesitas
  addTrainingDataPoint(5, 5, LAKI_LAKI, 31.7, 111.2, KURANG, AKTIF, "obesitas");
  // Row 24: 6,5,Perempuan,14.3,127.5,8.8,Berlebih,Sedang,Gizi Buruk
  addTrainingDataPoint(6, 5, PEREMPUAN, 14.3, 127.5, BERLEBIH, SEDANG, "gizi buruk");
  // Row 25: 5,10,Perempuan,26.5,107.4,23,Kurang,Aktif,Obesitas
  addTrainingDataPoint(5, 10, PEREMPUAN, 26.5, 107.4, KURANG, AKTIF, "obesitas");
  // Row 26: 7,0,Laki-laki,32,109,26.9,Berlebih,Sedang,Obesitas
  addTrainingDataPoint(7, 0, LAKI_LAKI, 32.0, 109.0, BERLEBIH, SEDANG, "obesitas");
  // Row 27: 6,4,Perempuan,30.5,125.9,19.2,Kurang,Aktif,Obesitas
  addTrainingDataPoint(6, 4, PEREMPUAN, 30.5, 125.9, KURANG, AKTIF, "obesitas");
  // Row 28: 7,6,Laki-laki,21.1,103.4,19.7,Cukup,Pasif,Obesitas
  addTrainingDataPoint(7, 6, LAKI_LAKI, 21.1, 103.4, CUKUP, PASIF, "obesitas");
  // Row 29: 5,11,Perempuan,16.9,129.8,10,Berlebih,Pasif,Gizi Buruk
  addTrainingDataPoint(5, 11, PEREMPUAN, 16.9, 129.8, BERLEBIH, PASIF, "gizi buruk");
  // Row 30: 6,1,Laki-laki,20.5,124.4,13.2,Berlebih,Sedang,Gizi Kurang
  addTrainingDataPoint(6, 1, LAKI_LAKI, 20.5, 124.4, BERLEBIH, SEDANG, "gizi kurang");
  // Row 31: 6,9,Perempuan,25.7,104,23.8,Berlebih,Aktif,Obesitas
  addTrainingDataPoint(6, 9, PEREMPUAN, 25.7, 104.0, BERLEBIH, AKTIF, "obesitas");
  // Row 32: 6,4,Laki-laki,20.4,127.6,12.5,Kurang,Aktif,Gizi Buruk
  addTrainingDataPoint(6, 4, LAKI_LAKI, 20.4, 127.6, KURANG, AKTIF, "gizi buruk");
  // Row 33: 5,6,Perempuan,32,111.9,25.6,Cukup,Pasif,Obesitas
  addTrainingDataPoint(5, 6, PEREMPUAN, 32.0, 111.9, CUKUP, PASIF, "obesitas");
  // Row 34: 7,4,Laki-laki,31.5,107.1,27.5,Berlebih,Sedang,Obesitas
  addTrainingDataPoint(7, 4, LAKI_LAKI, 31.5, 107.1, BERLEBIH, SEDANG, "obesitas");
  // Row 35: 7,4,Laki-laki,29,129,17.4,Kurang,Pasif,Overweight
  addTrainingDataPoint(7, 4, LAKI_LAKI, 29.0, 129.0, KURANG, PASIF, "overweight");
  // Row 36: 6,11,Laki-laki,26.3,102.9,24.8,Berlebih,Sedang,Obesitas
  addTrainingDataPoint(6, 11, LAKI_LAKI, 26.3, 102.9, BERLEBIH, SEDANG, "obesitas");
  // Row 37: 6,4,Perempuan,14.8,110.7,12.1,Berlebih,Sedang,Gizi Buruk
  addTrainingDataPoint(6, 4, PEREMPUAN, 14.8, 110.7, BERLEBIH, SEDANG, "gizi buruk");
  // Row 38: 7,3,Perempuan,27.9,100.9,27.4,Kurang,Aktif,Obesitas
  addTrainingDataPoint(7, 3, PEREMPUAN, 27.9, 100.9, KURANG, AKTIF, "obesitas");
  // Row 39: 6,4,Perempuan,33.1,101.7,32,Kurang,Sedang,Obesitas
  addTrainingDataPoint(6, 4, PEREMPUAN, 33.1, 101.7, KURANG, SEDANG, "obesitas");
  // Row 40: 7,4,Laki-laki,23.7,118,17,Berlebih,Aktif,Overweight
  addTrainingDataPoint(7, 4, LAKI_LAKI, 23.7, 118.0, BERLEBIH, AKTIF, "overweight");
  // Row 41: 6,3,Perempuan,26.2,128.2,15.9,Berlebih,Aktif,Gizi Baik
  addTrainingDataPoint(6, 3, PEREMPUAN, 26.2, 128.2, BERLEBIH, AKTIF, "gizi baik");
  // Row 42: 5,5,Laki-laki,32,118.3,22.9,Berlebih,Aktif,Obesitas
  addTrainingDataPoint(5, 5, LAKI_LAKI, 32.0, 118.3, BERLEBIH, AKTIF, "obesitas");
  // Row 43: 6,11,Laki-laki,30,112.4,23.7,Berlebih,Aktif,Obesitas
  addTrainingDataPoint(6, 11, LAKI_LAKI, 30.0, 112.4, BERLEBIH, AKTIF, "obesitas");
  // Row 44: 7,9,Perempuan,30.5,106.7,26.8,Cukup,Pasif,Obesitas
  addTrainingDataPoint(7, 9, PEREMPUAN, 30.5, 106.7, CUKUP, PASIF, "obesitas");
  // Row 45: 5,10,Laki-laki,34.6,111.7,27.7,Berlebih,Pasif,Obesitas
  addTrainingDataPoint(5, 10, LAKI_LAKI, 34.6, 111.7, BERLEBIH, PASIF, "obesitas");
  // Row 46: 6,3,Perempuan,20.2,116.1,15,Kurang,Aktif,Gizi Baik
  addTrainingDataPoint(6, 3, PEREMPUAN, 20.2, 116.1, KURANG, AKTIF, "gizi baik");
  // Row 47: 6,4,Perempuan,30.4,108.9,25.6,Berlebih,Sedang,Obesitas
  addTrainingDataPoint(6, 4, PEREMPUAN, 30.4, 108.9, BERLEBIH, SEDANG, "obesitas");
  // Row 48: 5,2,Laki-laki,21.8,127.3,13.5,Kurang,Pasif,Gizi Kurang
  addTrainingDataPoint(5, 2, LAKI_LAKI, 21.8, 127.3, KURANG, PASIF, "gizi kurang");
  // Row 49: 6,6,Laki-laki,26.2,118.5,18.7,Cukup,Pasif,Overweight
  addTrainingDataPoint(6, 6, LAKI_LAKI, 26.2, 118.5, CUKUP, PASIF, "overweight");
  // Row 50: 7,2,Perempuan,33.2,124.7,21.4,Cukup,Sedang,Obesitas
  addTrainingDataPoint(7, 2, PEREMPUAN, 33.2, 124.7, CUKUP, SEDANG, "obesitas");
  // Row 51: 6,11,Laki-laki,32.4,114.2,24.8,Berlebih,Aktif,Obesitas
  addTrainingDataPoint(6, 11, LAKI_LAKI, 32.4, 114.2, BERLEBIH, AKTIF, "obesitas");
  // Row 52: 7,2,Perempuan,25.1,123.3,16.5,Berlebih,Sedang,Gizi Baik
  addTrainingDataPoint(7, 2, PEREMPUAN, 25.1, 123.3, BERLEBIH, SEDANG, "gizi baik");
  // Row 53: 7,11,Laki-laki,15.5,122.1,10.4,Berlebih,Pasif,Gizi Buruk
  addTrainingDataPoint(7, 11, LAKI_LAKI, 15.5, 122.1, BERLEBIH, PASIF, "gizi buruk");
  // Row 54: 5,4,Perempuan,19.2,129,11.5,Kurang,Sedang,Gizi Buruk
  addTrainingDataPoint(5, 4, PEREMPUAN, 19.2, 129.0, KURANG, SEDANG, "gizi buruk");
  // Row 55: 7,3,Perempuan,27.9,102.6,26.5,Kurang,Pasif,Obesitas
  addTrainingDataPoint(7, 3, PEREMPUAN, 27.9, 102.6, KURANG, PASIF, "obesitas");
  // Row 56: 6,0,Laki-laki,31,100.8,30.5,Cukup,Aktif,Obesitas
  addTrainingDataPoint(6, 0, LAKI_LAKI, 31.0, 100.8, CUKUP, AKTIF, "obesitas");
  // Row 57: 7,2,Laki-laki,30.9,103.4,28.9,Cukup,Sedang,Obesitas
  addTrainingDataPoint(7, 2, LAKI_LAKI, 30.9, 103.4, CUKUP, SEDANG, "obesitas");
  // Row 58: 5,5,Laki-laki,29.1,127.3,18,Berlebih,Aktif,Overweight
  addTrainingDataPoint(5, 5, LAKI_LAKI, 29.1, 127.3, BERLEBIH, AKTIF, "overweight");
  // Row 59: 7,0,Perempuan,22.6,108.5,19.2,Berlebih,Pasif,Obesitas
  addTrainingDataPoint(7, 0, PEREMPUAN, 22.6, 108.5, BERLEBIH, PASIF, "obesitas");
  // Row 60: 7,7,Laki-laki,29.3,105.2,26.5,Cukup,Sedang,Obesitas
  addTrainingDataPoint(7, 7, LAKI_LAKI, 29.3, 105.2, CUKUP, SEDANG, "obesitas");
  // Row 61: 5,3,Perempuan,21.7,125.6,13.8,Berlebih,Aktif,Gizi Kurang
  addTrainingDataPoint(5, 3, PEREMPUAN, 21.7, 125.6, BERLEBIH, AKTIF, "gizi kurang");
  // Row 62: 6,3,Perempuan,33.7,107.8,29,Berlebih,Sedang,Obesitas
  addTrainingDataPoint(6, 3, PEREMPUAN, 33.7, 107.8, BERLEBIH, SEDANG, "obesitas");
  // Row 63: 5,9,Perempuan,17.2,109.4,14.4,Berlebih,Sedang,Gizi Kurang
  addTrainingDataPoint(5, 9, PEREMPUAN, 17.2, 109.4, BERLEBIH, SEDANG, "gizi kurang");
  // Row 64: 7,5,Laki-laki,22.7,121.5,15.4,Berlebih,Pasif,Gizi Baik
  addTrainingDataPoint(7, 5, LAKI_LAKI, 22.7, 121.5, BERLEBIH, PASIF, "gizi baik");
  // Row 65: 6,6,Perempuan,15.1,122,10.1,Cukup,Pasif,Gizi Buruk
  addTrainingDataPoint(6, 6, PEREMPUAN, 15.1, 122.0, CUKUP, PASIF, "gizi buruk");
  // Row 66: 5,10,Laki-laki,19.9,106.7,17.5,Kurang,Sedang,Overweight
  addTrainingDataPoint(5, 10, LAKI_LAKI, 19.9, 106.7, KURANG, SEDANG, "overweight");
  // Row 67: 5,11,Laki-laki,27.5,123.6,18,Cukup,Sedang,Overweight
  addTrainingDataPoint(5, 11, LAKI_LAKI, 27.5, 123.6, CUKUP, SEDANG, "overweight");
  // Row 68: 5,0,Laki-laki,21.4,119.7,14.9,Kurang,Aktif,Gizi Baik
  addTrainingDataPoint(5, 0, LAKI_LAKI, 21.4, 119.7, KURANG, AKTIF, "gizi baik");
  // Row 69: 6,6,Laki-laki,31.6,124.4,20.4,Cukup,Sedang,Obesitas
  addTrainingDataPoint(6, 6, LAKI_LAKI, 31.6, 124.4, CUKUP, SEDANG, "obesitas");
  // Row 70: 7,5,Perempuan,34.5,113.3,26.9,Kurang,Aktif,Obesitas
  addTrainingDataPoint(7, 5, PEREMPUAN, 34.5, 113.3, KURANG, AKTIF, "obesitas");
  // Row 71: 6,7,Perempuan,27.4,121,18.7,Berlebih,Aktif,Overweight
  addTrainingDataPoint(6, 7, PEREMPUAN, 27.4, 121.0, BERLEBIH, AKTIF, "overweight");
  // Row 72: 6,10,Perempuan,19.6,129.3,11.7,Cukup,Aktif,Gizi Buruk
  addTrainingDataPoint(6, 10, PEREMPUAN, 19.6, 129.3, CUKUP, AKTIF, "gizi buruk");
  // Row 73: 6,10,Laki-laki,32.9,108,28.2,Berlebih,Pasif,Obesitas
  addTrainingDataPoint(6, 10, LAKI_LAKI, 32.9, 108.0, BERLEBIH, PASIF, "obesitas");
  // Row 74: 7,5,Perempuan,24.8,127.3,15.3,Cukup,Aktif,Gizi Baik
  addTrainingDataPoint(7, 5, PEREMPUAN, 24.8, 127.3, CUKUP, AKTIF, "gizi baik");
  // Row 75: 5,2,Perempuan,25.8,117.9,18.6,Cukup,Sedang,Overweight
  addTrainingDataPoint(5, 2, PEREMPUAN, 25.8, 117.9, CUKUP, SEDANG, "overweight");
  // Row 76: 7,2,Laki-laki,15.5,116.9,11.3,Kurang,Pasif,Gizi Buruk
  addTrainingDataPoint(7, 2, LAKI_LAKI, 15.5, 116.9, KURANG, PASIF, "gizi buruk");
  // Row 77: 5,1,Laki-laki,33.5,106.5,29.5,Berlebih,Pasif,Obesitas
  addTrainingDataPoint(5, 1, LAKI_LAKI, 33.5, 106.5, BERLEBIH, PASIF, "obesitas");
  // Row 78: 7,0,Laki-laki,15.5,127,9.6,Kurang,Aktif,Gizi Buruk
  addTrainingDataPoint(7, 0, LAKI_LAKI, 15.5, 127.0, KURANG, AKTIF, "gizi buruk");
  // Row 79: 5,0,Laki-laki,14.2,107,12.4,Kurang,Pasif,Gizi Buruk
  addTrainingDataPoint(5, 0, LAKI_LAKI, 14.2, 107.0, KURANG, PASIF, "gizi buruk");
  // Row 80: 7,9,Perempuan,33.2,127.8,20.3,Cukup,Pasif,Obesitas
  addTrainingDataPoint(7, 9, PEREMPUAN, 33.2, 127.8, CUKUP, PASIF, "obesitas");
  // Row 81: 5,3,Laki-laki,25.2,116,18.7,Kurang,Pasif,Overweight
  addTrainingDataPoint(5, 3, LAKI_LAKI, 25.2, 116.0, KURANG, PASIF, "overweight");
  // Row 82: 6,0,Laki-laki,19.2,109,16.2,Kurang,Sedang,Gizi Baik
  addTrainingDataPoint(6, 0, LAKI_LAKI, 19.2, 109.0, KURANG, SEDANG, "gizi baik");
  // Row 83: 6,4,Laki-laki,18.8,120.2,13,Kurang,Sedang,Gizi Kurang
  addTrainingDataPoint(6, 4, LAKI_LAKI, 18.8, 120.2, KURANG, SEDANG, "gizi kurang");
  // Row 84: 7,0,Laki-laki,19.4,109.3,16.2,Kurang,Sedang,Gizi Baik
  addTrainingDataPoint(7, 0, LAKI_LAKI, 19.4, 109.3, KURANG, SEDANG, "gizi baik");
  // Row 85: 6,6,Laki-laki,29.2,121.1,19.9,Cukup,Sedang,Obesitas
  addTrainingDataPoint(6, 6, LAKI_LAKI, 29.2, 121.1, CUKUP, SEDANG, "obesitas");
  // Row 86: 7,9,Laki-laki,33.1,103.9,30.7,Cukup,Pasif,Obesitas
  addTrainingDataPoint(7, 9, LAKI_LAKI, 33.1, 103.9, CUKUP, PASIF, "obesitas");
  // Row 87: 5,3,Laki-laki,19.9,108.2,17,Kurang,Sedang,Overweight
  addTrainingDataPoint(5, 3, LAKI_LAKI, 19.9, 108.2, KURANG, SEDANG, "overweight");
  // Row 88: 5,9,Perempuan,26.5,123.6,17.3,Berlebih,Pasif,Overweight
  addTrainingDataPoint(5, 9, PEREMPUAN, 26.5, 123.6, BERLEBIH, PASIF, "overweight");
  // Row 89: 6,11,Laki-laki,20,124.1,13,Cukup,Pasif,Gizi Kurang
  addTrainingDataPoint(6, 11, LAKI_LAKI, 20.0, 124.1, CUKUP, PASIF, "gizi kurang");
  // Row 90: 6,7,Laki-laki,19.9,103.2,18.7,Cukup,Pasif,Overweight
  addTrainingDataPoint(6, 7, LAKI_LAKI, 19.9, 103.2, CUKUP, PASIF, "overweight");
  // Row 91: 5,8,Perempuan,26.4,126.4,16.5,Berlebih,Pasif,Gizi Baik
  addTrainingDataPoint(5, 8, PEREMPUAN, 26.4, 126.4, BERLEBIH, PASIF, "gizi baik");
  // Row 92: 7,8,Laki-laki,28.5,108.1,24.4,Berlebih,Pasif,Obesitas
  addTrainingDataPoint(7, 8, LAKI_LAKI, 28.5, 108.1, BERLEBIH, PASIF, "obesitas");
  // Row 93: 7,8,Laki-laki,15,101.2,14.6,Berlebih,Pasif,Gizi Baik
  addTrainingDataPoint(7, 8, LAKI_LAKI, 15.0, 101.2, BERLEBIH, PASIF, "gizi baik");
  // Row 94: 7,11,Laki-laki,26.2,119.9,18.2,Kurang,Sedang,Overweight
  addTrainingDataPoint(7, 11, LAKI_LAKI, 26.2, 119.9, KURANG, SEDANG, "overweight");
  // Row 95: 6,9,Laki-laki,21,123.2,13.8,Cukup,Aktif,Gizi Kurang
  addTrainingDataPoint(6, 9, LAKI_LAKI, 21.0, 123.2, CUKUP, AKTIF, "gizi kurang");
  // Row 96: 5,7,Laki-laki,25.2,115.3,19,Kurang,Sedang,Obesitas
  addTrainingDataPoint(5, 7, LAKI_LAKI, 25.2, 115.3, KURANG, SEDANG, "obesitas");
  // Row 97: 7,8,Laki-laki,17.9,123.3,11.8,Cukup,Aktif,Gizi Buruk
  addTrainingDataPoint(7, 8, LAKI_LAKI, 17.9, 123.3, CUKUP, AKTIF, "gizi buruk");
  // Row 98: 6,4,Perempuan,21,126.5,13.1,Berlebih,Sedang,Gizi Buruk
  addTrainingDataPoint(6, 4, PEREMPUAN, 21.0, 126.5, BERLEBIH, SEDANG, "gizi buruk");
  // Row 99: 6,7,Laki-laki,25.4,120.4,17.5,Kurang,Sedang,Overweight
  addTrainingDataPoint(6, 7, LAKI_LAKI, 25.4, 120.4, KURANG, SEDANG, "overweight");
  // Row 100: 5,10,Perempuan,30.2,125.6,19.1,Kurang,Sedang,Obesitas
  addTrainingDataPoint(5, 10, PEREMPUAN, 30.2, 125.6, KURANG, SEDANG, "obesitas");
  // Row 101: 6,6,Laki-laki,16.3,106.5,14.4,Cukup,Pasif,Gizi Kurang
  addTrainingDataPoint(6, 6, LAKI_LAKI, 16.3, 106.5, CUKUP, PASIF, "gizi kurang");

  Serial.print("Total training data added: ");
  Serial.println(nutritionKNN.getDataCount());
}

// CSV order: Usia(tahun), Usia(bulan), Jenis Kelamin, Berat(kg), Tinggi(cm), IMT, Pola Makan, Respon Anak, Status Gizi
void addTrainingDataPoint(int ageYears, int ageMonths, Gender gender, float weight, float height, PolaMakan eatingPattern, ResponAnak childResponse, const char* statusGizi) {
  // Calculate IMT for training data
  float imt = calculateIMT(weight, height);

  float features[] = {
    (float)ageYears,       // 0: Usia (tahun)
    (float)ageMonths,      // 1: Usia (bulan)
    (float)gender,         // 2: Jenis Kelamin (enum)
    weight,                // 3: Berat Badan (kg)
    height,                // 4: Tinggi Badan (cm)
    imt,                   // 5: IMT
    (float)eatingPattern,  // 6: Pola Makan (enum)
    (float)childResponse   // 7: Respon Anak (enum)
  };

  nutritionKNN.addTrainingData(statusGizi, features);
}

// Function to calculate IMT (BMI)
float calculateIMT(float weight, float height) {
  if (height <= 0) return 0.0;
  float heightInMeters = height / 100.0;  // Convert cm to meters
  return weight / (heightInMeters * heightInMeters);
}

// Encoding functions for categorical data using enums
Gender encodeGender(String gender) {
  if (gender.equals("male") || gender.equals("laki-laki") || gender.equals("Laki-laki") || gender.equals("L")) {
    return LAKI_LAKI;
  }
  return PEREMPUAN;  // Default to female
}

PolaMakan encodeEatingPattern(String pattern) {
  if (pattern.equals("kurang") || pattern.equals("Kurang")) return KURANG;
  if (pattern.equals("cukup") || pattern.equals("Cukup")) return CUKUP;
  if (pattern.equals("berlebih") || pattern.equals("Berlebih")) return BERLEBIH;
  return CUKUP;  // Default to cukup
}

ResponAnak encodeChildResponse(String response) {
  if (response.equals("pasif") || response.equals("Pasif")) return PASIF;
  if (response.equals("sedang") || response.equals("Sedang")) return SEDANG;
  if (response.equals("aktif") || response.equals("Aktif")) return AKTIF;
  return SEDANG;  // Default to sedang
}

// Helper function to convert nutrition status string to enum
StatusGizi encodeNutritionStatus(String status) {
  if (status.equals("gizi buruk") || status.equals("Gizi Buruk")) return GIZI_BURUK;
  if (status.equals("gizi kurang") || status.equals("Gizi Kurang")) return GIZI_KURANG;
  if (status.equals("gizi baik") || status.equals("Gizi Baik")) return GIZI_BAIK;
  if (status.equals("overweight") || status.equals("Overweight")) return OVERWEIGHT;
  if (status.equals("obesitas") || status.equals("Obesitas")) return OBESITAS;
  return GIZI_BAIK;  // Default
}

// Helper function to convert enum back to string
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