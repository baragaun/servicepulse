import schedule from 'node-schedule';

import { logger } from './logger.ts';

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
   * Schedule a job to run every minute
   * @param jobName Unique name for the job
   * @param callback Function to execute
   */
  public scheduleEveryMinute(jobName: string, callback: JobCallback): void {
    try {
      const job = schedule.scheduleJob('* * * * *', () => {
        this.executeJob(jobName, callback);
      });

      this.registerJob(jobName, job);
    } catch (error) {
      logger.error(`Failed to schedule job ${jobName}:`, error);
      throw error;
    }
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
  public scheduleCron(jobName: string, cronExpression: string, callback: JobCallback): void {
    try {
      const job = schedule.scheduleJob(cronExpression, () => {
        this.executeJob(jobName, callback);
      });

      this.registerJob(jobName, job);
    } catch (error) {
      logger.error(`Failed to schedule job ${jobName}:`, error);
      throw error;
    }
  }

  /**
   * Cancel a specific job by name
   * @param jobName Name of the job to cancel
   * @returns true if job was found and cancelled, false otherwise
   */
  public cancelJob(jobName: string): boolean {
    const job = this.jobs.get(jobName);

    if (job) {
      job.cancel();
      this.jobs.delete(jobName);
      logger.info(`Job ${jobName} cancelled`);
      return true;
    }

    logger.warn(`Job ${jobName} not found`);
    return false;
  }

  /**
   * Cancel all scheduled jobs
   */
  public cancelAllJobs(): void {
    for (const [jobName, job] of this.jobs.entries()) {
      job.cancel();
      logger.info(`Job ${jobName} cancelled`);
    }

    this.jobs.clear();
    logger.info('All jobs cancelled');
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
    this.cancelJob(jobName);

    // Register new job
    this.jobs.set(jobName, job);
    logger.info(`Job ${jobName} scheduled successfully`);
  }

  /**
   * Execute a job and handle any errors
   * @param jobName Name of the job
   * @param callback Function to execute
   */
  private executeJob(jobName: string, callback: JobCallback): void {
    try {
      logger.info(`Executing job: ${jobName}`);
      callback();
      logger.info(`Job ${jobName} completed successfully`);
    } catch (error) {
      logger.error(`Error executing job ${jobName}:`, error);
    }
  }
}
