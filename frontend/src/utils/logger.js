const enableLogs = process.env.REACT_APP_ENABLE_LOGS === 'true';

export const logger = {
  log: (...args) => {
    if (enableLogs) {
      console.log(...args);
    }
  },
  error: (...args) => {
    if (enableLogs) {
      console.error(...args);
    }
  },
  warn: (...args) => {
    if (enableLogs) {
      console.warn(...args);
    }
  },
  info: (...args) => {
    if (enableLogs) {
      console.info(...args);
    }
  },
};