import schedule from 'node-schedule';

import { logger } from '../../helpers/logger.js';

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
 * Job callback function type
 */
type JobCallback = () => void;

/**
 * JobScheduler class to manage scheduled jobs
 */
export class JobScheduler {
  private jobs: Map<string, schedule.Job>;

  /**
   * Constructor initializes the jobs map
   */
  constructor() {
    this.jobs = new Map<string, schedule.Job>();
    logger.info('Job scheduler initialized');
  }

  /**
   * Schedule a job to run hourly at the specified minute
   * @param jobName Unique name for the job
   * @param minute Minute of the hour (0-59)
   * @param callback Function to execute
   */
  public scheduleHourly(jobName: string, minute: number, callback: JobCallback): void {
    try {
      if (minute < 0 || minute > 59) {
        throw new Error('Minute must be between 0 and 59');
      }

      const job = schedule.scheduleJob(`${minute} * * * *`, () => {
        this.executeJob(jobName, callback);
      });

      this.registerJob(jobName, job);
    } catch (error) {
      logger.error(`Failed to schedule job ${jobName}:`, error);
      throw error;
    }
  }

  /**
   * Schedule a job to run daily at the specified time
   * @param jobName Unique name for the job
   * @param time Time in format 'HH:MM'
   * @param callback Function to execute
   */
  public scheduleDaily(jobName: string, time: string, callback: JobCallback): void {
    try {
      const [hours, minutes] = time.split(':').map(Number);

      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        throw new Error('Invalid time format. Use HH:MM (00-23:00-59)');
      }

      const job = schedule.scheduleJob(`${minutes} ${hours} * * *`, () => {
        this.executeJob(jobName, callback);
      });

      this.registerJob(jobName, job);
    } catch (error) {
      logger.error(`Failed to schedule job ${jobName}:`, error);
      throw error;
    }
  }

  /**
   * Schedule a job to run weekly on the specified day and time
   * @param jobName Unique name for the job
   * @param dayOfWeek Day of the week (0-6, where 0 is Sunday)
   * @param time Time in format 'HH:MM'
   * @param callback Function to execute
   */
  public scheduleWeekly(jobName: string, dayOfWeek: number, time: string, callback: JobCallback): void {
    try {
      const [hours, minutes] = time.split(':').map(Number);

      if (dayOfWeek < 0 || dayOfWeek > 6) {
        throw new Error('Day of week must be between 0 (Sunday) and 6 (Saturday)');
      }

      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        throw new Error('Invalid time format. Use HH:MM (00-23:00-59)');
      }

      const job = schedule.scheduleJob(`${minutes} ${hours} * * ${dayOfWeek}`, () => {
        this.executeJob(jobName, callback);
      });

      this.registerJob(jobName, job);
    } catch (error) {
      logger.error(`Failed to schedule job ${jobName}:`, error);
      throw error;
    }
  }

  /**
   * Schedule a job using a cron expression
   * @param jobName Unique name for the job
   * @param cronExpression Cron expression (e.g., '0 0 * * *' for midnight)
   * @param callback Function to execute
   */
  public scheduleCron(
    jobName: string,
    cronExpression: string,
    callback: JobCallback,
  ): void {
    try {
      if (Object.keys(_cronExpressions).includes(cronExpression)) {
        cronExpression = _cronExpressions[cronExpression as keyof typeof _cronExpressions];
      }
      const job = schedule.scheduleJob(cronExpression, () => {
        this.executeJob(jobName, callback);
      });

      this.registerJob(jobName, job);
      logger.info(`JobScheduler.scheduleCron: Registered job ${jobName}:`);
    } catch (error) {
      logger.error(`JobScheduler.scheduleCron: Failed to schedule job ${jobName}:`, error);
      throw error;
    }
  }

  /**
   * Cancel a specific job by name
   * @param jobName Name of the job to cancel
   * @param warnIfNotFound set to true to produce a warning if job not found
   * @returns true if job was found and cancelled, false otherwise
   */
  public cancelJob(jobName: string, warnIfNotFound: boolean): boolean {
    const job = this.jobs.get(jobName);

    if (!job) {
      if (warnIfNotFound) {
        logger.warn(`JobScheduler.cancelJob: Job ${jobName} not found`);
      }
      return false;
    }

    job.cancel();
    this.jobs.delete(jobName);
    logger.info(`Job ${jobName} cancelled`);

    return true;
  }

  /**
   * Cancel all scheduled jobs
   */
  public cancelAllJobs(): void {
    for (const [jobName, job] of this.jobs.entries()) {
      job.cancel();
      logger.info(`JobScheduler.cancelJob: Job ${jobName} cancelled`);
    }

    this.jobs.clear();
    logger.info('JobScheduler.cancelJob: All jobs cancelled');
  }

  /**
   * Get all scheduled job names
   * @returns Array of job names
   */
  public getScheduledJobs(): string[] {
    return Array.from(this.jobs.keys());
  }

  /**
   * Register a new job
   * @param jobName Name of the job
   * @param job Job instance
   */
  private registerJob(jobName: string, job: schedule.Job): void {
    // Cancel existing job with the same name if it exists
    this.cancelJob(jobName, false);

    // Register new job
    this.jobs.set(jobName, job);
    logger.info(`JobScheduler.registerJob: Job ${jobName} scheduled successfully`);
  }

  /**
   * Execute a job and handle any errors
   * @param jobName Name of the job
   * @param callback Function to execute
   */
  private executeJob(jobName: string, callback: JobCallback): void {
    try {
      logger.info(`JobScheduler.executeJob: Executing job: ${jobName}`);
      callback();
      logger.info(`JobScheduler.executeJob: Job ${jobName} completed successfully`);
    } catch (error) {
      logger.error(`JobScheduler.executeJob: Error executing job ${jobName}:`, error);
    }
  }
}
