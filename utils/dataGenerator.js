const nutritionStatuses = ['gizi buruk', 'gizi kurang', 'gizi baik', 'overweight', 'obesitas'];
const eatingPatterns = ['kurang', 'cukup', 'berlebih'];
const childResponses = ['pasif', 'sedang', 'aktif'];

const getRandomInRange = (min, max, decimals = 1) => {
  const random = Math.random() * (max - min) + min;
  return parseFloat(random.toFixed(decimals));
};

const getRandomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

export const generateRandomMeasurement = () => {
  const weight = getRandomInRange(15, 45, 1);
  const height = getRandomInRange(90, 130, 0);
  const nutritionStatus = getRandomElement(nutritionStatuses);
  const eatingPattern = getRandomElement(eatingPatterns);
  const childResponse = getRandomElement(childResponses);

  return {
    weight,
    height,
    nutritionStatus,
    eatingPattern,
    childResponse
  };
};

export const generateBulkMeasurements = (count = 5) => {
  const measurements = [];
  
  for (let i = 0; i < count; i++) {
    measurements.push(generateRandomMeasurement());
  }
  
  return measurements;
};