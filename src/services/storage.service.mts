import * as fs from "fs";
import * as path from "path";
import type { Job, ApplicationResult } from "../interfaces/index.mts";

export class StorageService {
  private dataDir = "./data";
  private applicationsFile = path.join(this.dataDir, "applications.json");
  private jobsFile = path.join(this.dataDir, "jobs.json");

  constructor() {
    this.ensureDataDirectory();
  }

  private ensureDataDirectory(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  async saveJobs(jobs: Job[]): Promise<void> {
    const existing = await this.loadJobs();
    const merged = this.mergeJobs(existing, jobs);

    fs.writeFileSync(this.jobsFile, JSON.stringify(merged, null, 2));
    console.log(`Saved ${merged.length} jobs to storage`);
  }

  async loadJobs(): Promise<Job[]> {
    if (!fs.existsSync(this.jobsFile)) {
      return [];
    }

    const data = fs.readFileSync(this.jobsFile, "utf-8");
    return JSON.parse(data) as Job[];
  }

  async saveApplication(result: ApplicationResult): Promise<void> {
    const applications = await this.loadApplications();
    applications.push(result);

    fs.writeFileSync(
      this.applicationsFile,
      JSON.stringify(applications, null, 2),
    );
    console.log(`Saved application result for job ${result.jobId}`);
  }

  async loadApplications(): Promise<ApplicationResult[]> {
    if (!fs.existsSync(this.applicationsFile)) {
      return [];
    }

    const data = fs.readFileSync(this.applicationsFile, "utf-8");
    return JSON.parse(data) as ApplicationResult[];
  }

  async getApplicationCountToday(): Promise<number> {
    const applications = await this.loadApplications();
    const today = new Date().toDateString();

    return applications.filter((app) => {
      const appDate = new Date(app.timestamp).toDateString();
      return appDate === today && app.success;
    }).length;
  }

  async markJobAsApplied(jobId: string): Promise<void> {
    const jobs = await this.loadJobs();
    const job = jobs.find((j) => j.id === jobId);

    if (job) {
      job.applied = true;
      job.appliedDate = new Date().toISOString();
      await this.saveJobs(jobs);
    }
  }

  private mergeJobs(existing: Job[], newJobs: Job[]): Job[] {
    const jobMap = new Map<string, Job>();

    // Add existing jobs
    existing.forEach((job) => jobMap.set(job.id, job));

    // Add or update with new jobs
    newJobs.forEach((job) => {
      if (!jobMap.has(job.id)) {
        jobMap.set(job.id, job);
      }
    });

    return Array.from(jobMap.values());
  }
}
