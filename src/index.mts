import 'dotenv/config';
import { loadConfig } from './config/index.mts';
import { BrowserService } from './services/browser.service.mts';
import { IndeedService } from './services/indeed.service.mts';
import { StorageService } from './services/storage.service.mts';
import { ProxyService } from './services/proxy.service.mts';
import type { ApplicationResult } from './types/index.mts';

async function main(): Promise<void> {
  console.log('🚀 Starting Indeed Job Applier');
  console.log('================================\n');

  try {
    // Load configuration
    const config = loadConfig();
    console.log('✓ Configuration loaded');

    // Initialize services
    const proxyService = new ProxyService(config);
    const browserService = new BrowserService(config);
    const indeedService = new IndeedService(config);
    const storageService = new StorageService();

    // Test proxy connection if enabled
    if (config.proxy.enabled) {
      const proxyOk = await proxyService.testConnection();
      if (!proxyOk) {
        console.error('❌ Proxy connection failed. Exiting...');
        return;
      }
      console.log('✓ Proxy connection successful');
    }

    // Launch browser
    const browser = await browserService.launch();
    console.log('✓ Browser launched');

    const page = await browserService.createPage();
    console.log('✓ New page created');

    // Login to Indeed
    const loggedIn = await indeedService.login(page);
    if (!loggedIn) {
      console.error('❌ Failed to login to Indeed');
      await browserService.close();
      return;
    }

    // Check daily application limit
    const applicationsToday = await storageService.getApplicationCountToday();
    console.log(`📊 Applications submitted today: ${applicationsToday}/${config.application.maxApplicationsPerDay}`);

    if (applicationsToday >= config.application.maxApplicationsPerDay) {
      console.log('⚠️  Daily application limit reached. Exiting...');
      await browserService.close();
      return;
    }

    // Search for jobs with each keyword
    const allJobs = [];
    for (const keyword of config.jobSearch.keywords) {
      console.log(`\n🔍 Searching for: "${keyword}"`);
      const jobs = await indeedService.searchJobs(page, keyword);
      allJobs.push(...jobs);
      console.log(`   Found ${jobs.length} jobs`);
    }

    // Save all found jobs
    await storageService.saveJobs(allJobs);

    // Filter out already applied jobs
    const existingJobs = await storageService.loadJobs();
    const unappliedJobs = allJobs.filter(job => {
      const existing = existingJobs.find(j => j.id === job.id);
      return !existing?.applied;
    });

    console.log(`\n📝 Found ${unappliedJobs.length} jobs to apply to`);

    // Apply to jobs
    let applicationsSubmitted = applicationsToday;
    
    for (const job of unappliedJobs) {
      if (applicationsSubmitted >= config.application.maxApplicationsPerDay) {
        console.log('\n⚠️  Reached daily application limit');
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
        error: applied ? undefined : 'Failed to apply',
      };

      await storageService.saveApplication(result);

      if (applied) {
        await storageService.markJobAsApplied(job.id);
        applicationsSubmitted++;
        console.log(`✓ Application submitted (${applicationsSubmitted}/${config.application.maxApplicationsPerDay})`);
      } else {
        console.log('✗ Application failed');
      }

      // Wait between applications to avoid detection
      const waitTime = 5000 + Math.random() * 5000; // 5-10 seconds
      console.log(`⏳ Waiting ${Math.round(waitTime / 1000)}s before next application...`);
      await page.waitForTimeout(waitTime);
    }

    console.log('\n================================');
    console.log('✅ Job application process completed');
    console.log(`📊 Total applications submitted: ${applicationsSubmitted - applicationsToday}`);

    // Close browser
    await browserService.close();
    console.log('✓ Browser closed');

  } catch (error) {
    console.error('\n❌ Error occurred:', error);
    process.exit(1);
  }
}

// Run the application
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
