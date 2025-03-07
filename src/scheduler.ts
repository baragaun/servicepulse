import schedule, { type Job } from 'node-schedule';

export class Scheduler {
  private jobs: Map<string, Job> = new Map();

  // Schedule a new job
  // @param jobName Name of the job
  // @param cronExpression Cron string (e.g., '*/5 * * * *' for every 5 minutes)
  // @param task The function to execute

  public scheduleJob(jobName: string, cronExpression: string, task: () => void): void {
    if (this.jobs.has(jobName)) {
      console.error(`Job "${jobName}" already exists.`);
      return;
    }

    const job = schedule.scheduleJob(cronExpression, task);
    this.jobs.set(jobName, job);
    console.log(`Scheduled job "${jobName}" with cron expression "${cronExpression}"`);
  }

  /**
   * Cancel a job
   * @param jobName Name of the job to cancel
   */
  public cancelJob(jobName: string): void {
    const job = this.jobs.get(jobName);
    if (job) {
      job.cancel();
      this.jobs.delete(jobName);
      console.log(`Cancelled job "${jobName}"`);
    } else {
      console.error(`Job "${jobName}" does not exist.`);
    }
  }
}

export const scheduler = new Scheduler();
