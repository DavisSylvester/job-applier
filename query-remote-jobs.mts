#!/usr/bin/env bun
import "dotenv/config";
import { loadConfig } from "./src/config/index.mts";
import { DatabaseService } from "./src/services/database.service.mts";
import { JobRepository } from "./src/repositories/job.repository.mts";

async function queryJobs(): Promise<void> {
  console.log("📊 Querying Stored Remote Jobs");
  console.log("================================\n");

  try {
    let config;
    try {
      config = loadConfig();
    } catch {
      // Use minimal config for database-only access
      config = {
        indeed: {
          email: "test@example.com",
          password: "test",
          authProvider: "password",
        },
        proxy: { host: "", port: 8080, enabled: false, smartProxy: false },
        jobSearch: { keywords: [], location: "", radius: 0, maxDaysOld: 5 },
        application: {
          autoApply: false,
          dryRun: true,
          maxApplicationsPerDay: 0,
          headless: true,
        },
        paths: { resume: "", coverLetter: "" },
        google: {},
        mongodb: {
          username: process.env.MONGO_USERNAME || "",
          password: process.env.MONGO_PASSWORD || "",
          host: process.env.MONGO_HOST || "",
          cluster: process.env.MONGO_CLUSTER || "",
          dbName: process.env.MONGO_DB_NAME || "",
        },
      };
    }

    const databaseService = new DatabaseService(config);
    await databaseService.connect();

    const jobRepository = new JobRepository();

    // Get all remote jobs
    const remoteJobs = await jobRepository.findAll({
      location: "Remote",
    });

    console.log(`✓ Found ${remoteJobs.length} remote jobs in database\n`);

    // Display all jobs
    console.log("📋 All Remote Jobs:");
    console.log("=".repeat(100));

    remoteJobs.forEach((job, index) => {
      console.log(`\n${index + 1}. ${job.title}`);
      console.log(`   Company: ${job.company}`);
      console.log(`   Location: ${job.location}`);
      console.log(`   Source: ${job.source}`);
      if (job.salary) console.log(`   Salary: ${job.salary}`);
      if (job.postedDate) console.log(`   Posted: ${job.postedDate}`);
      console.log(`   Applied: ${job.applied ? "✓ Yes" : "✗ No"}`);
      console.log(`   URL: ${job.url.substring(0, 80)}...`);
      console.log(`   Stored: ${job.createdAt.toLocaleDateString()}`);
    });

    // Statistics
    console.log("\n" + "=".repeat(100));
    console.log("\n📊 Statistics:");
    const stats = await jobRepository.getStats();
    console.log(`Total jobs: ${stats.total}`);
    console.log(`Applied: ${stats.applied}`);
    console.log(`Not applied: ${stats.notApplied}`);

    const remoteCount = await jobRepository.count({ location: "Remote" });
    console.log(`\nRemote jobs: ${remoteCount}`);

    const indeedCount = await jobRepository.count({ source: "Indeed" });
    console.log(`Indeed source: ${indeedCount}`);

    await databaseService.disconnect();
    console.log("\n✓ Query completed");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

queryJobs();
