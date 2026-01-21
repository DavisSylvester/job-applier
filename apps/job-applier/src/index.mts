import "dotenv/config";
import { loadConfig } from "@job-applier/config";
import {
  BrowserService,
  IndeedService,
  StorageService,
  ProxyService,
  JobBoardsService,
  DatabaseService,
  JobRepository,
} from "@job-applier/core";
import type { ApplicationResult } from "@job-applier/interfaces";

async function main(): Promise<void> {
  console.log("🚀 Starting Indeed Job Applier");
  console.log("================================\n");

  try {
    // Load configuration
    const config = loadConfig();
    console.log("✓ Configuration loaded");

    // Initialize database connection
    const databaseService = new DatabaseService(config);
    await databaseService.connect();

    // Initialize services
    const jobRepository = new JobRepository();
    jobRepository.initialize(databaseService.getDb());
    const proxyService = new ProxyService(config);
    const browserService = new BrowserService(config);
    const indeedService = new IndeedService(config);
    const storageService = new StorageService();

    // Test proxy connection if enabled
    if (config.proxy.enabled) {
      const proxyOk = await proxyService.testConnection();
      if (!proxyOk) {
        console.error("❌ Proxy connection failed. Exiting...");
        return;
      }
      console.log("✓ Proxy connection successful");
    }

    // Launch browser
    const browser = await browserService.launch();
    console.log("✓ Browser launched");

    const page = await browserService.createPage();
    console.log("✓ New page created");

    // Login to Indeed
    const loggedIn = await indeedService.login(page);
    if (!loggedIn) {
      console.error("❌ Failed to login to Indeed");
      await browserService.close();
      return;
    }

    // Check daily application limit
    const applicationsToday = await storageService.getApplicationCountToday();
    console.log(
      `📊 Applications submitted today: ${applicationsToday}/${config.application.maxApplicationsPerDay}`,
    );

    if (applicationsToday >= config.application.maxApplicationsPerDay) {
      console.log("⚠️  Daily application limit reached. Exiting...");
      await browserService.close();
      return;
    }

    // Search for jobs
    const allJobs = [];

    if (process.env.DECODO_DALLAS === "true") {
      console.log("\n🔍 Decodo Dallas/75495 NodeJS search (radius 100)");
      const boards = new JobBoardsService(jobRepository);
      boards.addBoard(indeedService);
      const jobs = await boards.searchByLocations(
        page,
        "nodejs",
        ["Dallas, TX", "75495"],
        100,
      );
      allJobs.push(...jobs);
      console.log(`   Found ${jobs.length} jobs`);
    } else {
      for (const keyword of config.jobSearch.keywords) {
        console.log(`\n🔍 Searching for: "${keyword}"`);
        const jobs = await indeedService.searchJobs(page, keyword);
        allJobs.push(...jobs);
        console.log(`   Found ${jobs.length} jobs`);
      }
    }

    // Save all found jobs
    await storageService.saveJobs(allJobs);

    // Filter out already applied jobs
    const existingJobs = await storageService.loadJobs();
    const unappliedJobs = allJobs.filter((job) => {
      const existing = existingJobs.find((j) => j.id === job.id);
      return !existing?.applied;
    });

    console.log(`\n📝 Found ${unappliedJobs.length} jobs to apply to`);

    // Apply to jobs
    let applicationsSubmitted = applicationsToday;

    for (const job of unappliedJobs) {
      if (applicationsSubmitted >= config.application.maxApplicationsPerDay) {
        console.log("\n⚠️  Reached daily application limit");
        break;
      }

      console.log(`\n📋 Processing: ${job.title} at ${job.company}`);

      // Get full job details
      const jobWithDetails = await indeedService.getJobDetails(page, job);

      // Apply to the job
      const applied = await indeedService.applyToJob(page, jobWithDetails);

      // Record the application result
      const result: ApplicationResult = {
        jobId: job.id,
        success: applied,
        timestamp: new Date().toISOString(),
        error: applied ? undefined : "Failed to apply",
      };

      await storageService.saveApplication(result);

      if (applied) {
        await storageService.markJobAsApplied(job.id);
        applicationsSubmitted++;
        console.log(
          `✓ Application submitted (${applicationsSubmitted}/${config.application.maxApplicationsPerDay})`,
        );
      } else {
        console.log("✗ Application failed");
      }

      // Wait between applications to avoid detection
      const waitTime = 5000 + Math.random() * 5000; // 5-10 seconds
      console.log(
        `⏳ Waiting ${Math.round(waitTime / 1000)}s before next application...`,
      );
      await page.waitForTimeout(waitTime);
    }

    console.log("\n================================");
    console.log("✅ Job application process completed");
    console.log(
      `📊 Total applications submitted: ${applicationsSubmitted - applicationsToday}`,
    );

    // Display database statistics
    const stats = await jobRepository.getStats();
    console.log(`\n📊 Database Statistics:`);
    console.log(`   Total jobs stored: ${stats.total}`);
    console.log(`   Applied: ${stats.applied}`);
    console.log(`   Not applied: ${stats.notApplied}`);

    // Close browser and database
    await browserService.close();
    console.log("✓ Browser closed");

    await databaseService.disconnect();
    console.log("✓ Database disconnected");
  } catch (error) {
    console.error("\n❌ Error occurred:", error);
    process.exit(1);
  }
}

// Run the application
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
