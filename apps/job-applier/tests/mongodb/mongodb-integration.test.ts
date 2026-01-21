import { describe, test, expect } from "bun:test";
import { loadConfig } from "../src/config/index.mts";
import { DatabaseService } from "../src/services/database.service.mts";
import { JobRepository } from "../src/repositories/job.repository.mts";
import type { Job } from "../src/interfaces/job.mts";

describe("MongoDB Integration", () => {
  test("should connect to MongoDB", async () => {
    const config = loadConfig();
    const databaseService = new DatabaseService(config);

    await databaseService.connect();
    expect(databaseService.isConnectedToDatabase()).toBe(true);

    await databaseService.disconnect();
  });

  test("should save a job to MongoDB", async () => {
    const config = loadConfig();
    const databaseService = new DatabaseService(config);
    await databaseService.connect();

    const jobRepository = new JobRepository();

    const testJob: Job = {
      id: `test-${Date.now()}`,
      title: "Senior Software Engineer",
      company: "Tech Corp",
      location: "Dallas, TX",
      url: `https://indeed.com/job/test-${Date.now()}`,
      description: "Test job description for MongoDB integration",
      source: "Indeed",
      salary: "$120k-$150k",
      postedDate: new Date().toISOString(),
      applied: false,
    };

    const savedJob = await jobRepository.save(testJob);
    expect(savedJob).toBeDefined();
    expect(savedJob.title).toBe(testJob.title);
    expect(savedJob.company).toBe(testJob.company);

    await databaseService.disconnect();
  });

  test("should save multiple jobs with upsert", async () => {
    const config = loadConfig();
    const databaseService = new DatabaseService(config);
    await databaseService.connect();

    const jobRepository = new JobRepository();

    const testJobs: Job[] = [
      {
        id: `test-1-${Date.now()}`,
        title: "Frontend Developer",
        company: "Web Solutions",
        location: "Dallas, TX",
        url: `https://indeed.com/job/test-1-${Date.now()}`,
        description: "Frontend development position",
        source: "Indeed",
        applied: false,
      },
      {
        id: `test-2-${Date.now()}`,
        title: "Backend Developer",
        company: "Server Systems",
        location: "Austin, TX",
        url: `https://indeed.com/job/test-2-${Date.now()}`,
        description: "Backend development position",
        source: "Indeed",
        applied: false,
      },
    ];

    const savedCount = await jobRepository.saveMany(testJobs);
    expect(savedCount).toBeGreaterThan(0);

    await databaseService.disconnect();
  });

  test("should retrieve job statistics", async () => {
    const config = loadConfig();
    const databaseService = new DatabaseService(config);
    await databaseService.connect();

    const jobRepository = new JobRepository();
    const stats = await jobRepository.getStats();

    expect(stats).toBeDefined();
    expect(typeof stats.total).toBe("number");
    expect(typeof stats.applied).toBe("number");
    expect(typeof stats.notApplied).toBe("number");

    await databaseService.disconnect();
  });
});
