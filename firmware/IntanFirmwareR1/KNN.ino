// KNN instance untuk klasifikasi status gizi
// Features: [weight, height, age_years, age_months, gender, eating_pattern, child_response, imt]
KNN nutritionKNN(5, 8, 100);  // k=5, 8 fitur (tambah IMT), max 100 data training

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
  // Encode categorical data to numeric
  float genderNumeric = encodeGender(gender);
  float eatingPatternNumeric = encodeEatingPattern(eatingPattern);
  float childResponseNumeric = encodeChildResponse(childResponse);
  
  // Calculate IMT (BMI)
  float imt = calculateIMT(weight, height);

  // Prepare feature array
  float features[] = {
    weight,                // 0: weight in kg
    height,                // 1: height in cm
    (float)ageYears,       // 2: age in years
    (float)ageMonths,      // 3: age in months
    genderNumeric,         // 4: gender (0=female, 1=male)
    eatingPatternNumeric,  // 5: eating pattern (0=kurang, 1=cukup, 2=berlebih)
    childResponseNumeric,  // 6: child response (0=pasif, 1=sedang, 2=aktif)
    imt                    // 7: IMT (BMI) calculated value
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
  Serial.println("Adding nutrition training data from real dataset...");

  // Real training data from dataset.csv - Boys (Laki-laki)
  // Gizi Buruk - Boys 
  addTrainingDataPoint("gizi buruk", 15.5, 111.5, 6, 79, 1, 0, 1);  // IMT: 12.5
  addTrainingDataPoint("gizi buruk", 15.0, 108.1, 6, 75, 1, 1, 0);   // IMT: 12.8
  addTrainingDataPoint("gizi buruk", 20.4, 127.6, 6, 76, 1, 0, 2);   // IMT: 12.5

  // Gizi Kurang - Boys
  addTrainingDataPoint("gizi kurang", 20.5, 124.4, 6, 73, 1, 2, 1);  // IMT: 13.2
  addTrainingDataPoint("gizi kurang", 21.8, 127.3, 5, 62, 1, 0, 0);  // IMT: 13.5

  // Gizi Baik - Boys
  addTrainingDataPoint("gizi baik", 21.1, 117.0, 7, 93, 1, 1, 1);    // IMT: 15.4
  addTrainingDataPoint("gizi baik", 17.1, 105.9, 6, 77, 1, 0, 1);    // IMT: 15.2
  addTrainingDataPoint("gizi baik", 23.7, 118.0, 7, 88, 1, 2, 2);    // IMT: 17.0
  addTrainingDataPoint("gizi baik", 26.2, 118.1, 6, 75, 1, 2, 2);    // IMT: 15.0

  // Overweight - Boys
  addTrainingDataPoint("overweight", 29.0, 129.0, 7, 88, 1, 0, 0);   // IMT: 17.4
  addTrainingDataPoint("overweight", 26.2, 118.5, 6, 78, 1, 1, 0);   // IMT: 18.7

  // Obesitas - Boys
  addTrainingDataPoint("obesitas", 30.1, 117.8, 6, 76, 1, 2, 1);     // IMT: 21.7
  addTrainingDataPoint("obesitas", 23.7, 105.5, 6, 73, 1, 0, 2);     // IMT: 21.3
  addTrainingDataPoint("obesitas", 23.5, 100.8, 5, 68, 1, 2, 2);     // IMT: 23.1
  addTrainingDataPoint("obesitas", 31.7, 111.2, 5, 65, 1, 0, 2);     // IMT: 25.6
  addTrainingDataPoint("obesitas", 32.0, 109.0, 7, 84, 1, 2, 1);     // IMT: 26.9
  addTrainingDataPoint("obesitas", 21.1, 103.4, 7, 90, 1, 1, 0);     // IMT: 19.7
  addTrainingDataPoint("obesitas", 31.5, 107.1, 7, 88, 1, 2, 1);     // IMT: 27.5
  addTrainingDataPoint("obesitas", 26.3, 102.9, 6, 83, 1, 2, 1);     // IMT: 24.8
  addTrainingDataPoint("obesitas", 32.0, 118.3, 5, 65, 1, 2, 2);     // IMT: 22.9
  addTrainingDataPoint("obesitas", 30.0, 112.4, 6, 83, 1, 2, 2);     // IMT: 23.7
  addTrainingDataPoint("obesitas", 34.6, 111.7, 5, 70, 1, 2, 0);     // IMT: 27.7

  // Real training data from dataset.csv - Girls (Perempuan)
  // Gizi Buruk - Girls
  addTrainingDataPoint("gizi buruk", 16.9, 120.6, 6, 83, 0, 2, 0);   // IMT: 11.6
  addTrainingDataPoint("gizi buruk", 17.1, 121.2, 6, 81, 0, 0, 0);   // IMT: 11.6
  addTrainingDataPoint("gizi buruk", 14.3, 127.5, 6, 77, 0, 2, 1);   // IMT: 8.8
  addTrainingDataPoint("gizi buruk", 16.9, 129.8, 5, 71, 0, 2, 0);   // IMT: 10.0
  addTrainingDataPoint("gizi buruk", 14.8, 110.7, 6, 76, 0, 2, 1);   // IMT: 12.1

  // Gizi Kurang - No specific examples in dataset for girls

  // Gizi Baik - Girls
  addTrainingDataPoint("gizi baik", 20.2, 113.9, 5, 60, 0, 0, 0);    // IMT: 15.6
  addTrainingDataPoint("gizi baik", 23.2, 120.8, 6, 75, 0, 1, 0);    // IMT: 15.9
  addTrainingDataPoint("gizi baik", 27.2, 129.7, 5, 68, 0, 0, 2);    // IMT: 16.2
  addTrainingDataPoint("gizi baik", 25.2, 129.5, 6, 72, 0, 2, 0);    // IMT: 15.0
  addTrainingDataPoint("gizi baik", 20.2, 116.1, 6, 75, 0, 0, 2);    // IMT: 15.0
  addTrainingDataPoint("gizi baik", 26.2, 128.2, 6, 75, 0, 2, 2);    // IMT: 15.9

  // Overweight - No specific examples in dataset for girls

  // Obesitas - Girls
  addTrainingDataPoint("obesitas", 29.6, 110.1, 6, 77, 0, 1, 0);     // IMT: 24.4
  addTrainingDataPoint("obesitas", 25.8, 110.4, 7, 84, 0, 2, 0);     // IMT: 21.2
  addTrainingDataPoint("obesitas", 28.8, 113.9, 6, 78, 0, 0, 1);     // IMT: 22.2
  addTrainingDataPoint("obesitas", 26.8, 109.9, 6, 81, 0, 1, 1);     // IMT: 22.2
  addTrainingDataPoint("obesitas", 26.1, 113.9, 6, 81, 0, 2, 1);     // IMT: 20.1
  addTrainingDataPoint("obesitas", 32.4, 126.5, 5, 71, 0, 2, 0);     // IMT: 20.2
  addTrainingDataPoint("obesitas", 32.7, 112.2, 5, 70, 0, 1, 0);     // IMT: 26.0
  addTrainingDataPoint("obesitas", 30.7, 104.7, 6, 82, 0, 2, 2);     // IMT: 28.0
  addTrainingDataPoint("obesitas", 26.5, 107.4, 5, 70, 0, 0, 2);     // IMT: 23.0
  addTrainingDataPoint("obesitas", 30.5, 125.9, 6, 76, 0, 0, 2);     // IMT: 19.2
  addTrainingDataPoint("obesitas", 25.7, 104.0, 6, 81, 0, 2, 2);     // IMT: 23.8
  addTrainingDataPoint("obesitas", 32.0, 111.9, 5, 66, 0, 1, 0);     // IMT: 25.6
  addTrainingDataPoint("obesitas", 27.9, 100.9, 7, 87, 0, 0, 2);     // IMT: 27.4
  addTrainingDataPoint("obesitas", 33.1, 101.7, 6, 76, 0, 0, 1);     // IMT: 32.0
  addTrainingDataPoint("obesitas", 30.5, 106.7, 7, 93, 0, 1, 0);     // IMT: 26.8
  addTrainingDataPoint("obesitas", 30.4, 108.9, 6, 76, 0, 2, 1);     // IMT: 25.6
  addTrainingDataPoint("obesitas", 33.2, 124.7, 7, 86, 0, 1, 1);     // IMT: 21.4

  Serial.print("Total training data added: ");
  Serial.println(nutritionKNN.getDataCount());
}

void addTrainingDataPoint(const char* label, float weight, float height, int ageYears, int ageMonths, int gender, int eatingPattern, int childResponse) {
  // Calculate IMT for training data
  float imt = calculateIMT(weight, height);
  
  float features[] = {
    weight,
    height,
    (float)ageYears,
    (float)ageMonths,
    (float)gender,
    (float)eatingPattern,
    (float)childResponse,
    imt
  };

  nutritionKNN.addTrainingData(label, features);
}

// Function to calculate IMT (BMI)
float calculateIMT(float weight, float height) {
  if (height <= 0) return 0.0;
  float heightInMeters = height / 100.0;  // Convert cm to meters
  return weight / (heightInMeters * heightInMeters);
}

// Encoding functions for categorical data
float encodeGender(String gender) {
  if (gender.equals("male") || gender.equals("laki-laki") || gender.equals("L")) {
    return 1.0;  // Male
  }
  return 0.0;  // Female
}

float encodeEatingPattern(String pattern) {
  if (pattern.equals("kurang")) return 0.0;
  if (pattern.equals("cukup")) return 1.0;
  if (pattern.equals("berlebih")) return 2.0;
  return 1.0;  // Default to cukup
}

float encodeChildResponse(String response) {
  if (response.equals("pasif")) return 0.0;
  if (response.equals("sedang")) return 1.0;
  if (response.equals("aktif")) return 2.0;
  return 1.0;  // Default to sedang
}