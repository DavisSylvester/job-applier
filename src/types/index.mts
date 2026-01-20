export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  description: string;
  salary?: string;
  postedDate?: string;
  applied: boolean;
  appliedDate?: string;
}

export interface ApplicationResult {
  jobId: string;
  success: boolean;
  error?: string;
  timestamp: string;
}

export interface ProxyConfig {
  server: string;
  username?: string;
  password?: string;
}

import type { Page } from 'playwright';

export interface JobBoardService {

  name: string;

  login(page: Page): Promise<boolean>;

  searchJobs(
    page: Page,
    keyword: string,
    options?: { location?: string; radius?: number }
  ): Promise<Job[]>;

  getJobDetails(page: Page, job: Job): Promise<Job>;

  applyToJob(page: Page, job: Job): Promise<boolean>;
}
