import type { Page } from 'playwright';
import type { Config } from '../config/index.mts';
import type { Job } from '../types/index.mts';
import { IndeedService } from './indeed.service.mts';

export class IndeedDecodoService {

  private config: Config;
  private indeedService: IndeedService;

  constructor(config: Config, indeedService: IndeedService) {
    this.config = config;
    this.indeedService = indeedService;
  }

  async searchNodeJobsDallasOrZip(page: Page): Promise<Job[]> {
    const keyword = 'nodejs';

    const [dallasJobs, zipJobs] = await Promise.all([
      this.indeedService.searchJobs(page, keyword, { location: 'Dallas, TX', radius: 100 }),
      this.indeedService.searchJobs(page, keyword, { location: '75495', radius: 100 }),
    ]);

    const merged = this.dedupById([...dallasJobs, ...zipJobs]);

    // Persist results using StorageService is handled elsewhere in the app
    return merged;
  }

  private dedupById(jobs: Job[]): Job[] {
    const map = new Map<string, Job>();
    for (const job of jobs) {
      if (!map.has(job.id)) map.set(job.id, job);
    }
    return Array.from(map.values());
  }
}
