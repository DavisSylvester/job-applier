import type { Page } from 'playwright';
import type { Job, JobBoardService } from '../types/index.mts';

export class JobBoardsService {

  private boards: JobBoardService[] = [];

  addBoard(board: JobBoardService): void {
    this.boards.push(board);
  }

  getBoards(): JobBoardService[] {
    return this.boards.slice();
  }

  async search(
    page: Page,
    keyword: string,
    options?: { location?: string; radius?: number }
  ): Promise<Job[]> {
    const results = await Promise.all(
      this.boards.map(b => b.searchJobs(page, keyword, options))
    );

    return this.dedupById(results.flat());
  }

  async searchByLocations(
    page: Page,
    keyword: string,
    locations: string[],
    radius: number
  ): Promise<Job[]> {
    const perBoardResults: Job[][] = [];

    for (const board of this.boards) {
      const byLocation = await Promise.all(
        locations.map(loc => board.searchJobs(page, keyword, { location: loc, radius }))
      );
      perBoardResults.push(...byLocation);
    }

    return this.dedupById(perBoardResults.flat());
  }

  private dedupById(jobs: Job[]): Job[] {
    const map = new Map<string, Job>();
    for (const job of jobs) {
      if (!map.has(job.id)) map.set(job.id, job);
    }
    return Array.from(map.values());
  }
}
