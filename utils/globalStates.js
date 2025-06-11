export const GLOBAL_SESSION_TYPES = {
  WEIGHING: 'weighing',
  RFID: 'rfid',
};

export const GLOBAL_SESSION_STATES = {
  IDLE: 'idle',
  ACTIVE: 'active',
  TIMEOUT: 'timeout',
  COMPLETED: 'completed',
};

export const SESSION_TIMEOUTS = {
  RFID: 5 * 60 * 1000,
  WEIGHING: 10 * 60 * 1000,
};

export const getSessionStatusMessage = (systemStatus) => {
  if (!systemStatus?.isInUse) {
    return "Siap untuk mulai";
  }

  if (systemStatus.timeout) {
    return "Session timeout, silakan coba lagi";
  }

  switch (systemStatus.sessionType) {
    case GLOBAL_SESSION_TYPES.WEIGHING:
      if (systemStatus.measurementComplete) {
        return "Pengukuran selesai!";
      }
      return `Sedang digunakan untuk timbang oleh ${systemStatus.currentUserName}`;
    
    case GLOBAL_SESSION_TYPES.RFID:
      if (systemStatus.rfid) {
        return "RFID berhasil dibaca!";
      }
      return `Sedang digunakan untuk pairing RFID oleh ${systemStatus.currentUserName}`;
    
    default:
      return `Sedang digunakan oleh ${systemStatus.currentUserName}`;
  }
};

export const isSessionAvailable = (systemStatus) => {
  return !systemStatus?.isInUse || systemStatus?.timeout;
};

export const isMySession = (systemStatus, userId) => {
  return systemStatus?.currentUserId === userId;
};