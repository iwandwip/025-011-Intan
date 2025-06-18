// KNN instance untuk klasifikasi status gizi
// Features: [weight, height, age_years, age_months, gender, eating_pattern, child_response]
KNN nutritionKNN(5, 7, 100);  // k=5, 7 fitur, max 100 data training

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
  
  // Prepare feature array
  float features[] = {
    weight,                    // 0: weight in kg
    height,                   // 1: height in cm
    (float)ageYears,          // 2: age in years
    (float)ageMonths,         // 3: age in months
    genderNumeric,            // 4: gender (0=female, 1=male)
    eatingPatternNumeric,     // 5: eating pattern (0=kurang, 1=cukup, 2=berlebih)
    childResponseNumeric      // 6: child response (0=pasif, 1=sedang, 2=aktif)
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
  Serial.println("Adding nutrition training data...");
  
  // Based on BMI categories from dataset.jpg:
  // Boys: <13.0 (gizi buruk), 13.0-14.5 (gizi kurang), 14.5-17.0 (gizi baik), 17.0-19.0 (overweight), >19.0 (obesitas)
  // Girls: <13.2 (gizi buruk), 13.2-14.7 (gizi kurang), 14.7-17.2 (gizi baik), 17.2-19.0 (overweight), >19.0 (obesitas)
  
  // Sample training data for boys (gender=1)
  // Gizi Buruk - Boys
  addTrainingDataPoint("gizi buruk", 20.0, 110.0, 5, 60, 1, 0, 0);  // Low weight, poor eating, passive
  addTrainingDataPoint("gizi buruk", 18.5, 105.0, 4, 48, 1, 0, 0);
  addTrainingDataPoint("gizi buruk", 22.0, 115.0, 6, 72, 1, 0, 1);
  addTrainingDataPoint("gizi buruk", 19.0, 108.0, 5, 54, 1, 1, 0);
  
  // Gizi Kurang - Boys
  addTrainingDataPoint("gizi kurang", 24.0, 110.0, 5, 60, 1, 0, 1);
  addTrainingDataPoint("gizi kurang", 26.5, 115.0, 6, 72, 1, 1, 1);
  addTrainingDataPoint("gizi kurang", 23.5, 108.0, 5, 54, 1, 0, 0);
  addTrainingDataPoint("gizi kurang", 25.0, 112.0, 5, 66, 1, 1, 1);
  
  // Gizi Baik - Boys
  addTrainingDataPoint("gizi baik", 28.0, 110.0, 5, 60, 1, 1, 2);
  addTrainingDataPoint("gizi baik", 30.5, 115.0, 6, 72, 1, 2, 2);
  addTrainingDataPoint("gizi baik", 27.5, 108.0, 5, 54, 1, 1, 1);
  addTrainingDataPoint("gizi baik", 29.0, 112.0, 5, 66, 1, 1, 2);
  addTrainingDataPoint("gizi baik", 32.0, 118.0, 6, 78, 1, 2, 2);
  
  // Overweight - Boys
  addTrainingDataPoint("overweight", 35.0, 110.0, 5, 60, 1, 2, 1);
  addTrainingDataPoint("overweight", 38.5, 115.0, 6, 72, 1, 2, 2);
  addTrainingDataPoint("overweight", 36.0, 112.0, 5, 66, 1, 2, 1);
  
  // Obesitas - Boys
  addTrainingDataPoint("obesitas", 42.0, 110.0, 5, 60, 1, 2, 0);
  addTrainingDataPoint("obesitas", 45.5, 115.0, 6, 72, 1, 2, 1);
  addTrainingDataPoint("obesitas", 44.0, 112.0, 5, 66, 1, 2, 0);
  
  // Sample training data for girls (gender=0)
  // Gizi Buruk - Girls
  addTrainingDataPoint("gizi buruk", 19.0, 110.0, 5, 60, 0, 0, 0);
  addTrainingDataPoint("gizi buruk", 17.5, 105.0, 4, 48, 0, 0, 0);
  addTrainingDataPoint("gizi buruk", 21.0, 115.0, 6, 72, 0, 0, 1);
  addTrainingDataPoint("gizi buruk", 18.0, 108.0, 5, 54, 0, 1, 0);
  
  // Gizi Kurang - Girls
  addTrainingDataPoint("gizi kurang", 23.5, 110.0, 5, 60, 0, 0, 1);
  addTrainingDataPoint("gizi kurang", 25.0, 115.0, 6, 72, 0, 1, 1);
  addTrainingDataPoint("gizi kurang", 22.5, 108.0, 5, 54, 0, 0, 0);
  addTrainingDataPoint("gizi kurang", 24.0, 112.0, 5, 66, 0, 1, 1);
  
  // Gizi Baik - Girls
  addTrainingDataPoint("gizi baik", 27.5, 110.0, 5, 60, 0, 1, 2);
  addTrainingDataPoint("gizi baik", 29.5, 115.0, 6, 72, 0, 2, 2);
  addTrainingDataPoint("gizi baik", 26.5, 108.0, 5, 54, 0, 1, 1);
  addTrainingDataPoint("gizi baik", 28.0, 112.0, 5, 66, 0, 1, 2);
  addTrainingDataPoint("gizi baik", 31.0, 118.0, 6, 78, 0, 2, 2);
  
  // Overweight - Girls
  addTrainingDataPoint("overweight", 34.0, 110.0, 5, 60, 0, 2, 1);
  addTrainingDataPoint("overweight", 37.0, 115.0, 6, 72, 0, 2, 2);
  addTrainingDataPoint("overweight", 35.5, 112.0, 5, 66, 0, 2, 1);
  
  // Obesitas - Girls
  addTrainingDataPoint("obesitas", 41.0, 110.0, 5, 60, 0, 2, 0);
  addTrainingDataPoint("obesitas", 44.0, 115.0, 6, 72, 0, 2, 1);
  addTrainingDataPoint("obesitas", 43.0, 112.0, 5, 66, 0, 2, 0);
  
  Serial.print("Total training data added: ");
  Serial.println(nutritionKNN.getDataCount());
}

void addTrainingDataPoint(const char* label, float weight, float height, int ageYears, int ageMonths, int gender, int eatingPattern, int childResponse) {
  float features[] = {
    weight,
    height,
    (float)ageYears,
    (float)ageMonths,
    (float)gender,
    (float)eatingPattern,
    (float)childResponse
  };
  
  nutritionKNN.addTrainingData(label, features);
}

// Encoding functions for categorical data
float encodeGender(String gender) {
  if (gender.equals("male") || gender.equals("laki-laki") || gender.equals("L")) {
    return 1.0;  // Male
  }
  return 0.0;    // Female
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