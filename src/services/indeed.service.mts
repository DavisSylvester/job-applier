import type { Page } from 'playwright';
import type { Job, JobBoardService } from '../types/index.mts';
import type { Config } from '../config/index.mts';

export class IndeedService implements JobBoardService {

  private config: Config;
  private baseUrl = 'https://www.indeed.com';
  public name = 'indeed';

  constructor(config: Config) {
    this.config = config;
  }

  async login(page: Page): Promise<boolean> {
    try {
      console.log('Navigating to Indeed login page...');
      await page.goto(`${this.baseUrl}/account/login`, { waitUntil: 'networkidle' });

      if (this.config.indeed.authProvider === 'google') {
        return await this.loginWithGoogle(page);
      }

      // Default password-based login
      await page.fill('input[type="email"]', this.config.indeed.email);
      await page.click('button[type="submit"]');

      await page.waitForTimeout(2000);

      await page.fill('input[type="password"]', this.config.indeed.password);
      await page.click('button[type="submit"]');

      await page.waitForLoadState('networkidle');
      console.log('Successfully logged in to Indeed');
      return true;
    } catch (error) {
      console.error('Failed to login to Indeed:', error);
      return false;
    }
  }

  async searchJobs(page: Page, keyword: string, options?: { location?: string; radius?: number }): Promise<Job[]> {
    try {
      const searchUrl = this.buildSearchUrl(
        keyword,
        options?.location,
        options?.radius
      );
      console.log(`Searching for jobs: ${searchUrl}`);
      
      await page.goto(searchUrl, { waitUntil: 'networkidle' });

      // Wait for job cards to load
      await page.waitForSelector('.job_seen_beacon, .jobsearch-SerpJobCard, [data-testid="job-card"]', { timeout: 10000 });

      // Extract job listings
      const jobs = await page.evaluate(() => {
        const jobCards = document.querySelectorAll('.job_seen_beacon, .jobsearch-SerpJobCard, [data-testid="job-card"]');
        const results: Job[] = [];

        jobCards.forEach((card) => {
          const titleElement = card.querySelector('h2 a, .jobTitle a') as HTMLAnchorElement;
          const companyElement = card.querySelector('[data-testid="company-name"], .companyName');
          const locationElement = card.querySelector('[data-testid="text-location"], .companyLocation');
          const salaryElement = card.querySelector('.salary-snippet, [data-testid="attribute_snippet_testid"]');
          
          if (titleElement) {
            results.push({
              id: card.getAttribute('data-jk') || titleElement.href.split('jk=')[1]?.split('&')[0] || '',
              title: titleElement.innerText.trim(),
              company: companyElement?.textContent?.trim() || 'Unknown',
              location: locationElement?.textContent?.trim() || 'Unknown',
              url: titleElement.href,
              description: '',
              salary: salaryElement?.textContent?.trim(),
              applied: false,
            });
          }
        });

        return results;
      });

      console.log(`Found ${jobs.length} jobs`);
      return jobs;
    } catch (error) {
      console.error('Failed to search jobs:', error);
      return [];
    }
  }

  async getJobDetails(page: Page, job: Job): Promise<Job> {
    try {
      await page.goto(job.url, { waitUntil: 'networkidle' });
      
      const description = await page.evaluate(() => {
        const descElement = document.querySelector('#jobDescriptionText, .jobsearch-jobDescriptionText');
        return descElement?.textContent?.trim() || '';
      });

      return { ...job, description };
    } catch (error) {
      console.error(`Failed to get job details for ${job.id}:`, error);
      return job;
    }
  }

  async applyToJob(page: Page, job: Job): Promise<boolean> {
    try {
      if (this.config.application.dryRun) {
        console.log(`[DRY RUN] Would apply to: ${job.title} at ${job.company}`);
        return true;
      }

      console.log(`Applying to: ${job.title} at ${job.company}`);
      await page.goto(job.url, { waitUntil: 'networkidle' });

      // Look for "Apply now" button
      const applyButton = await page.$('button:has-text("Apply now"), .indeed-apply-button, [id*="apply"]');
      
      if (!applyButton) {
        console.log('No direct apply button found - job may require external application');
        return false;
      }

      await applyButton.click();
      await page.waitForTimeout(2000);

      // Handle resume upload if needed
      const uploadInput = await page.$('input[type="file"]');
      if (uploadInput && this.config.paths.resume) {
        await uploadInput.setInputFiles(this.config.paths.resume);
        console.log('Resume uploaded');
      }

      // Submit application (this will vary by Indeed's current UI)
      const submitButton = await page.$('button:has-text("Submit"), button:has-text("Continue")');
      if (submitButton && !this.config.application.dryRun) {
        await submitButton.click();
        await page.waitForTimeout(3000);
      }

      console.log(`Successfully applied to ${job.title}`);
      return true;
    } catch (error) {
      console.error(`Failed to apply to job ${job.id}:`, error);
      return false;
    }
  }

  private buildSearchUrl(keyword: string, location?: string, radius?: number): string {
    const params = new URLSearchParams({
      q: keyword,
      l: (location ?? this.config.jobSearch.location),
      radius: (radius ?? this.config.jobSearch.radius).toString(),
    });

    return `${this.baseUrl}/jobs?${params.toString()}`;
  }

  private async loginWithGoogle(page: Page): Promise<boolean> {
    if (!this.config.google.email || !this.config.google.password) {
      console.error('Google credentials are not set in config');
      return false;
    }

    try {
      const googleButtonSelector = 'button:has-text("Continue with Google"), a:has-text("Continue with Google")';

      const [popup] = await Promise.all([
        page.waitForEvent('popup'),
        page.click(googleButtonSelector)
      ]);

      await popup.waitForLoadState('domcontentloaded');

      // Enter email
      await popup.fill('input[type="email"]', this.config.google.email);
      await popup.click('#identifierNext, button:has-text("Next")');
      await popup.waitForTimeout(1500);

      // Enter password
      await popup.fill('input[type="password"]', this.config.google.password);
      await popup.click('#passwordNext, button:has-text("Next")');

      // Wait for the popup to close or redirect back
      await popup.waitForLoadState('networkidle');

      // Give main page time to reflect login status
      await page.waitForLoadState('networkidle');

      console.log('Successfully logged in to Indeed via Google');
      return true;
    } catch (error) {
      console.error('Google login failed:', error);
      return false;
    }
  }
}
