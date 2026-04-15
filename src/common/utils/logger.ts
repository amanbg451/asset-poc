// src/common/utils/logger.ts
export const logger = {
  debug: (message: string, meta?: any) => {
    console.log(`[DEBUG] ${message}`, meta || '');
  },
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${message}`, meta || '');
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${message}`, meta || '');
  },
  error: (message: string, meta?: any) => {
    console.error(`[ERROR] ${message}`, meta || '');
  },
};