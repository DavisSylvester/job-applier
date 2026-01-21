import type { Page } from "playwright";
import type { Job } from "./job.mts";

export interface JobBoardService {
  name: string;

  login(page: Page): Promise<boolean>;

  searchJobs(
    page: Page,
    keyword: string,
    options?: { location?: string; radius?: number },
  ): Promise<Job[]>;

  getJobDetails(page: Page, job: Job): Promise<Job>;

  applyToJob(page: Page, job: Job): Promise<boolean>;
}
