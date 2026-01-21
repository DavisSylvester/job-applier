import type { Page } from "playwright";
import type { Job, JobBoardService } from "@job-applier/interfaces";
import { JobRepository } from "../repositories/job.repository.mts";

export class JobBoardsService {
  private boards: JobBoardService[] = [];
  private jobRepository: JobRepository;

  constructor(jobRepository: JobRepository) {
    this.jobRepository = jobRepository;
  }

  addBoard(board: JobBoardService): void {
    this.boards.push(board);
  }

  getBoards(): JobBoardService[] {
    return this.boards.slice();
  }

  async search(
    page: Page,
    keyword: string,
    options?: { location?: string; radius?: number },
  ): Promise<Job[]> {
    const results = await Promise.all(
      this.boards.map((b) => b.searchJobs(page, keyword, options)),
    );

    const dedupedJobs = this.dedupById(results.flat());
    // Save jobs to database
    if (dedupedJobs.length > 0) {
      try {
        const savedCount = await this.jobRepository.saveMany(dedupedJobs);
        console.log(`✓ Saved ${savedCount} jobs to database`);
      } catch (error) {
        console.error("Failed to save jobs to database:", error);
      }
    }

    console.log(
      `\n✓ Search complete: Found ${dedupedJobs.length} unique jobs for "${keyword}"`,
    );

    return dedupedJobs;
  }

  async searchByLocations(
    page: Page,
    keyword: string,
    locations: string[],
    radius: number,
  ): Promise<Job[]> {
    const perBoardResults: Job[][] = [];

    for (const board of this.boards) {
      const byLocation = await Promise.all(
        locations.map((loc) =>
          board.searchJobs(page, keyword, { location: loc, radius }),
        ),
      );
      perBoardResults.push(...byLocation);
    }

    const dedupedJobs = this.dedupById(perBoardResults.flat());

    // Save jobs to database
    if (dedupedJobs.length > 0) {
      try {
        const savedCount = await this.jobRepository.saveMany(dedupedJobs);
        console.log(`✓ Saved ${savedCount} jobs to database\n`);
      } catch (error) {
        console.error("Failed to save jobs to database:", error);
      }
    }

    console.log(`\n========================================`);
    console.log(`✓ Search complete: Found ${dedupedJobs.length} unique jobs`);
    console.log(`  Keyword: "${keyword}"`);
    console.log(`  Locations: ${locations.join(", ")}`);
    console.log(`  Radius: ${radius} miles`);
    console.log(`========================================\n`);

    return dedupedJobs;
  }

  private dedupById(jobs: Job[]): Job[] {
    const map = new Map<string, Job>();
    for (const job of jobs) {
      if (!map.has(job.id)) map.set(job.id, job);
    }
    return Array.from(map.values());
  }
}
