import schedule from 'node-schedule';

import appLogger from '../../helpers/logger.js';

const logger = appLogger.child({ scope: 'CheckScheduler' });

const _cronExpressions = {
  everyMinute: '* * * * *',
  every10Minutes: '*/10 * * * *',
  every30Minutes: '*/30 * * * *',
  midnight: '0 0 * * *',
  hourly: '0 * * * *',
  daily: '0 0 * * *',
  weekly: '0 0 * * 0', // Sunday at midnight
}
/**
 * Check callback function type
 */
type CheckCallback = () => void;

/**
 * CheckScheduler class to manage scheduled checks
 */
export class CheckScheduler {
  private checks: Map<string, schedule.Job>;

  /**
   * Constructor initializes the checks map
   */
  constructor() {
    this.checks = new Map<string, schedule.Job>();
    logger.info('Check scheduler initialized');
  }

  /**
   * Schedule a check to run hourly at the specified minute
   * @param checkName Unique name for the check
   * @param minute Minute of the hour (0-59)
   * @param callback Function to execute
   */
  public scheduleHourly(checkName: string, minute: number, callback: CheckCallback): void {
    if (minute < 0 || minute > 59) {
      throw new Error('Minute must be between 0 and 59');
    }

    try {
      const check = schedule.scheduleJob(`${minute} * * * *`, () => {
        this.runCheck(checkName, callback);
      });

      this.registerCheck(checkName, check);
    } catch (error) {
      logger.error(`Failed to schedule check ${checkName}:`, error);
      throw error;
    }
  }

  /**
   * Schedule a check to run daily at the specified time
   * @param checkName Unique name for the check
   * @param time Time in format 'HH:MM'
   * @param callback Function to execute
   */
  public scheduleDaily(checkName: string, time: string, callback: CheckCallback): void {
    const [hours, minutes] = time.split(':').map(Number);

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error('Invalid time format. Use HH:MM (00-23:00-59)');
    }

    try {
      const check = schedule.scheduleJob(`${minutes} ${hours} * * *`, () => {
        this.runCheck(checkName, callback);
      });

      this.registerCheck(checkName, check);
    } catch (error) {
      logger.error(`Failed to schedule check ${checkName}:`, error);
      throw error;
    }
  }

  /**
   * Schedule a check to run weekly on the specified day and time
   * @param checkName Unique name for the check
   * @param dayOfWeek Day of the week (0-6, where 0 is Sunday)
   * @param time Time in format 'HH:MM'
   * @param callback Function to execute
   */
  public scheduleWeekly(checkName: string, dayOfWeek: number, time: string, callback: CheckCallback): void {
    const [hours, minutes] = time.split(':').map(Number);

    if (dayOfWeek < 0 || dayOfWeek > 6) {
      throw new Error('Day of week must be between 0 (Sunday) and 6 (Saturday)');
    }

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error('Invalid time format. Use HH:MM (00-23:00-59)');
    }

    try {
      const check = schedule.scheduleJob(`${minutes} ${hours} * * ${dayOfWeek}`, () => {
        this.runCheck(checkName, callback);
      });

      this.registerCheck(checkName, check);
    } catch (error) {
      logger.error(`Failed to schedule check ${checkName}:`, error);
      throw error;
    }
  }

  /**
   * Schedule a check using a cron expression
   * @param checkName Unique name for the check
   * @param cronExpression Cron expression (e.g., '0 0 * * *' for midnight)
   * @param callback Function to execute
   */
  public scheduleCron(
    checkName: string,
    cronExpression: string,
    callback: CheckCallback,
  ): void {
    try {
      if (Object.keys(_cronExpressions).includes(cronExpression)) {
        cronExpression = _cronExpressions[cronExpression as keyof typeof _cronExpressions];
      }
      const check = schedule.scheduleJob(cronExpression, () => {
        this.runCheck(checkName, callback);
      });

      this.registerCheck(checkName, check);
      logger.info(`CheckScheduler.scheduleCron: Registered check ${checkName}:`);
    } catch (error) {
      logger.error(`CheckScheduler.scheduleCron: Failed to schedule check ${checkName}:`, error);
      throw error;
    }
  }

  /**
   * Cancel a specific check by name
   * @param checkName Name of the check to cancel
   * @param warnIfNotFound set to true to produce a warning if check not found
   * @returns true if check was found and cancelled, false otherwise
   */
  public cancelCheck(checkName: string, warnIfNotFound: boolean): boolean {
    const check = this.checks.get(checkName);

    if (!check) {
      if (warnIfNotFound) {
        logger.warn(`CheckScheduler.cancelCheck: Check ${checkName} not found`);
      }
      return false;
    }

    check.cancel();
    this.checks.delete(checkName);
    logger.info(`Check ${checkName} cancelled`);

    return true;
  }

  /**
   * Cancel all scheduled checks
   */
  public cancelAllChecks(): void {
    for (const [checkName, check] of this.checks.entries()) {
      check.cancel();
      logger.info(`CheckScheduler.cancelCheck: Check ${checkName} cancelled`);
    }

    this.checks.clear();
    logger.info('CheckScheduler.cancelCheck: All checks cancelled');
  }

  /**
   * Get all scheduled check names
   * @returns Array of check names
   */
  public getScheduledChecks(): string[] {
    return Array.from(this.checks.keys());
  }

  /**
   * Register a new check
   * @param checkName Name of the check
   * @param check Check instance
   */
  private registerCheck(checkName: string, check: schedule.Job): void {
    // Cancel existing check with the same name if it exists
    this.cancelCheck(checkName, false);

    // Register new check
    this.checks.set(checkName, check);
    logger.info(`registerCheck: Check ${checkName} scheduled successfully`);
  }

  /**
   * Execute a check and handle any errors
   * @param checkName Name of the check
   * @param callback Function to execute
   */
  private runCheck(checkName: string, callback: CheckCallback): void {
    try {
      logger.info(`runCheck: Executing check: ${checkName}`);
      callback();
      logger.info(`runCheck: Check ${checkName} completed successfully`);
    } catch (error) {
      logger.error(`runCheck: Error executing check ${checkName}:`, error);
    }
  }
}
