export const RFID_PAIRING_STATES = {
  IDLE: 0,
  WAITING: 1,
  ERROR: 2
};

export const RFID_PAIRING_TIMEOUT = 60000; // 1 minute in milliseconds

export const isRfidPairingExpired = (timestamp) => {
  if (!timestamp) return false;
  
  const now = new Date().getTime();
  const pairingTime = timestamp.toDate ? timestamp.toDate().getTime() : new Date(timestamp).getTime();
  
  return (now - pairingTime) > RFID_PAIRING_TIMEOUT;
};

export const getRfidPairingStatus = (state) => {
  switch (state) {
    case RFID_PAIRING_STATES.WAITING:
      return "Waiting for RFID card...";
    case RFID_PAIRING_STATES.ERROR:
      return "Pairing failed. Please try again.";
    default:
      return "Ready to pair";
  }
};