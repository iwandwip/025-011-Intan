export const WEIGHING_STATES = {
  IDLE: 0,
  WAITING: 1,
  MEASURING: 2,
  COMPLETED: 3,
  ERROR: 4
};

export const WEIGHING_TIMEOUT = 300000;

export const isWeighingExpired = (timestamp) => {
  if (!timestamp) return false;
  
  const now = new Date().getTime();
  const weighingTime = timestamp.toDate ? timestamp.toDate().getTime() : new Date(timestamp).getTime();
  
  return (now - weighingTime) > WEIGHING_TIMEOUT;
};

export const getWeighingStatusMessage = (state) => {
  switch (state) {
    case WEIGHING_STATES.WAITING:
      return "Waiting for RFID card tap...";
    case WEIGHING_STATES.MEASURING:
      return "Measuring in progress...";
    case WEIGHING_STATES.COMPLETED:
      return "Measurement completed!";
    case WEIGHING_STATES.ERROR:
      return "Error occurred during measurement";
    default:
      return "Ready to start weighing";
  }
};