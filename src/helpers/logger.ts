/**
 * Simple logger utility
 */
export const logger = {
  /**
   * Log informational message
   * @param message Message to log
   * @param optionalParams Additional parameters
   */
  info(message: string, ...optionalParams: unknown[]): void {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...optionalParams);
  },

  /**
   * Log warning message
   * @param message Message to log
   * @param optionalParams Additional parameters
   */
  warn(message: string, ...optionalParams: unknown[]): void {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...optionalParams);
  },

  /**
   * Log error message
   * @param message Message to log
   * @param optionalParams Additional parameters
   */
  error(message: string, ...optionalParams: unknown[]): void {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...optionalParams);
  },

  /**
   * Log debug message
   * @param message Message to log
   * @param optionalParams Additional parameters
   */
  debug(message: string, ...optionalParams: unknown[]): void {
    if (process.env.DEBUG === 'true') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...optionalParams);
    }
  }
};
