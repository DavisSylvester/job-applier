#!/usr/bin/env bun
import "dotenv/config";
import { loadConfig } from "./src/config/index.mts";
import { BrowserService } from "./src/services/browser.service.mts";
import { IndeedService } from "./src/services/indeed.service.mts";
import { ProxyService } from "./src/services/proxy.service.mts";
import { JobBoardsService } from "./src/services/job-boards.service.mts";
import { DatabaseService } from "./src/services/database.service.mts";
import { JobRepository } from "./src/repositories/job.repository.mts";

async function testRemoteJobs(): Promise<void> {
  console.log("🚀 Starting Remote Job Search Test");
  console.log("===================================\n");

  try {
    // Load configuration
    let config;
    try {
      config = loadConfig();
      console.log("✓ Configuration loaded");
    } catch (error) {
      console.log("⚠️  Configuration validation failed, using test defaults");
      console.log("   (This is normal if Indeed credentials are not set)");
      // Create minimal config for testing
      config = {
        indeed: {
          email: "test@example.com",
          password: "test",
          authProvider: "password",
        },
        proxy: { host: "", port: 8080, enabled: false, smartProxy: false },
        jobSearch: {
          keywords: [],
          location: "Remote",
          radius: 0,
          maxDaysOld: 5,
        },
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

    // Initialize database connection
    const databaseService = new DatabaseService(config);
    await databaseService.connect();

    // Initialize services
    const jobRepository = new JobRepository();
    jobRepository.initialize(databaseService.getDb());
    const proxyService = new ProxyService(config);
    const browserService = new BrowserService(config);
    const indeedService = new IndeedService(config);

    // Test proxy if enabled
    if (config.proxy.enabled) {
      const proxyOk = await proxyService.testConnection();
      if (!proxyOk) {
        console.warn(
          "⚠️  Proxy connection failed, continuing without proxy...",
        );
      } else {
        console.log("✓ Proxy connection successful");
      }
    }

    // Launch browser
    const browser = await browserService.launch();
    console.log("✓ Browser launched");

    const page = await browserService.createPage();
    console.log("✓ New page created");

    // Skip login for public job search
    console.log("\n🔍 Performing public job search (no login required)");
    console.log("   Note: Some features may be limited without login");

    // Search for remote jobs with specified keywords
    const keywords = ["typescript", "nodejs", "aws", "azure"];
    const allJobs = [];

    const jobBoardsService = new JobBoardsService(jobRepository);
    jobBoardsService.addBoard(indeedService);

    console.log("\n🔍 Searching for Remote Jobs");
    console.log("Keywords:", keywords.join(", "));
    console.log("Location: Remote\n");

    for (const keyword of keywords) {
      console.log(`\n📋 Searching for: "${keyword}" (Remote)`);
      console.log("─".repeat(50));

      const jobs = await indeedService.searchJobs(page, keyword, {
        location: "Remote",
        radius: 0, // Remote jobs don't need radius
      });

      console.log(`✓ Found ${jobs.length} jobs for "${keyword}"`);
      allJobs.push(...jobs);
    }

    // Deduplicate jobs by URL
    const uniqueJobs = Array.from(
      new Map(allJobs.map((job) => [job.url, job])).values(),
    );

    console.log("\n" + "=".repeat(50));
    console.log(`📊 Total Unique Jobs Found: ${uniqueJobs.length}`);
    console.log("=".repeat(50));

    // Save to database
    if (uniqueJobs.length > 0) {
      console.log("\n💾 Saving jobs to database...");
      const savedCount = await jobRepository.saveMany(uniqueJobs);
      console.log(`✓ Saved/Updated ${savedCount} jobs in MongoDB`);

      // Display sample jobs
      console.log("\n📋 Sample Jobs:");
      console.log("─".repeat(80));
      uniqueJobs.slice(0, 5).forEach((job, index) => {
        console.log(`\n${index + 1}. ${job.title}`);
        console.log(`   Company: ${job.company}`);
        console.log(`   Location: ${job.location}`);
        console.log(`   Source: ${job.source}`);
        if (job.salary) console.log(`   Salary: ${job.salary}`);
        if (job.postedDate) console.log(`   Posted: ${job.postedDate}`);
        console.log(`   URL: ${job.url}`);
      });

      if (uniqueJobs.length > 5) {
        console.log(`\n   ... and ${uniqueJobs.length - 5} more jobs`);
      }
    } else {
      console.log("\n⚠️  No jobs found");
    }

    // Get database statistics
    console.log("\n" + "=".repeat(50));
    console.log("📊 Database Statistics");
    console.log("=".repeat(50));

    const stats = await jobRepository.getStats();
    console.log(`Total jobs in database: ${stats.total}`);
    console.log(`Applied: ${stats.applied}`);
    console.log(`Not applied: ${stats.notApplied}`);

    // Get count by source
    const indeedCount = await jobRepository.count({ source: "Indeed" });
    console.log(`\nIndeed jobs: ${indeedCount}`);

    // Get remote jobs count
    const remoteCount = await jobRepository.count({ location: "Remote" });
    console.log(`Remote jobs: ${remoteCount}`);

    // Close browser and database
    await browserService.close();
    console.log("\n✓ Browser closed");

    await databaseService.disconnect();
    console.log("✓ Database disconnected");

    console.log("\n" + "=".repeat(50));
    console.log("✅ Test Completed Successfully!");
    console.log("=".repeat(50));
  } catch (error) {
    console.error("\n❌ Error occurred:", error);
    process.exit(1);
  }
}

// Run the test
testRemoteJobs().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
