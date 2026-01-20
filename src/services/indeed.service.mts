import type { Page } from "playwright";
import type { Job, JobBoardService } from "../interfaces/index.mts";
import type { Config } from "../config/index.mts";
import type { BrowserService } from "./browser.service.mts";

export class IndeedService implements JobBoardService {
  private config: Config;
  private baseUrl = "https://www.indeed.com";
  public name = "indeed";
  private browserService?: BrowserService;

  constructor(config: Config, browserService?: BrowserService) {
    this.config = config;
    this.browserService = browserService;
  }

  async login(page: Page): Promise<boolean> {
    try {
      console.log("Navigating to Indeed login page...");
      await page.goto(`${this.baseUrl}/account/login`, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      if (this.config.indeed.authProvider === "google") {
        return await this.loginWithGoogle(page);
      }

      // Default password-based login
      await page.fill('input[type="email"]', this.config.indeed.email);
      await page.click('button[type="submit"]');

      await page.waitForTimeout(2000);

      await page.fill('input[type="password"]', this.config.indeed.password);
      await page.click('button[type="submit"]');

      await page.waitForLoadState("domcontentloaded");
      console.log("Successfully logged in to Indeed");
      return true;
    } catch (error) {
      console.error("Failed to login to Indeed:", error);
      return false;
    }
  }

  async searchJobs(
    page: Page,
    keyword: string,
    options?: {
      location?: string;
      radius?: number;
      maxPages?: number;
      maxDaysOld?: number;
    },
  ): Promise<Job[]> {
    const maxPages = options?.maxPages || 3; // Default to 3 pages (~45 jobs)
    const maxDaysOld = options?.maxDaysOld ?? this.config.jobSearch.maxDaysOld;
    const allJobs: Job[] = [];
    const seenJobIds = new Set<string>();
    let shouldStopPagination = false;

    console.log(`Filtering jobs posted within the last ${maxDaysOld} days`);

    try {
      for (
        let pageNum = 0;
        pageNum < maxPages && !shouldStopPagination;
        pageNum++
      ) {
        // Rotate proxy before each page to get a new IP
        if (pageNum > 0 && this.browserService && this.config.proxy.enabled) {
          const proxyService = this.browserService.getProxyService();
          proxyService.rotateProxy();
          console.log(`Rotated proxy for page ${pageNum + 1}`);

          // Add extra delay after proxy rotation to appear more human-like
          await page.waitForTimeout(Math.random() * 3000 + 5000); // 5-8 seconds
        }

        const searchUrl = this.buildSearchUrl(
          keyword,
          options?.location,
          options?.radius,
          pageNum * 10, // Indeed uses start parameter (0, 10, 20, 30...)
        );
        console.log(
          `Searching for jobs (page ${pageNum + 1}/${maxPages}): ${searchUrl}`,
        );

        // Add random delay to simulate human behavior
        await page.waitForTimeout(Math.random() * 2000 + 1000);

        // Try multiple navigation strategies
        let navigationSuccess = false;

        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            console.log(`Navigation attempt ${attempt}...`);

            console.log(`Navigating to search URL: ${searchUrl}`);

            await page.goto(searchUrl, {
              waitUntil: "domcontentloaded",
              timeout: 30000,
            });

            // Wait a bit for dynamic content
            await page.waitForTimeout(2000);

            navigationSuccess = true;
            break;
          } catch (error) {
            console.warn(`Navigation attempt ${attempt} failed:`, error);
            if (attempt < 3) {
              await page.waitForTimeout(2000 * attempt);
            }
          }
        }

        if (!navigationSuccess) {
          console.warn(
            `Failed to load page ${pageNum + 1}, stopping pagination`,
          );
          break;
        }

        // Wait for job cards to load with increased timeout
        try {
          await page.waitForSelector(
            '.job_seen_beacon, .jobsearch-SerpJobCard, [data-testid="job-card"]',
            { timeout: 15000 },
          );
        } catch {
          console.warn(
            `No more job cards found on page ${pageNum + 1}, stopping pagination`,
          );
          break;
        }

        // Extract job listings
        const jobs = await page.evaluate(() => {
          const jobCards = document.querySelectorAll(
            '.job_seen_beacon, .jobsearch-SerpJobCard, [data-testid="job-card"]',
          );
          const results: Job[] = [];

          jobCards.forEach((card) => {
            const titleElement = card.querySelector(
              "h2 a, .jobTitle a",
            ) as HTMLAnchorElement;
            const companyElement = card.querySelector(
              '[data-testid="company-name"], .companyName',
            );
            const locationElement = card.querySelector(
              '[data-testid="text-location"], .companyLocation',
            );
            const salaryElement = card.querySelector(
              '.salary-snippet, [data-testid="attribute_snippet_testid"]',
            );

            // Try multiple selectors for date
            const dateElement =
              card.querySelector('[data-testid="myJobsStateDate"]') ||
              card.querySelector(".date") ||
              card.querySelector("span.date") ||
              card.querySelector('span[class*="date"]') ||
              card.querySelector("table td.resultContent span:last-child") ||
              Array.from(card.querySelectorAll("span")).find((span) =>
                /just posted|today|\d+ days? ago|posted \d+/i.test(
                  span.textContent || "",
                ),
              );

            if (titleElement) {
              results.push({
                id:
                  card.getAttribute("data-jk") ||
                  titleElement.href.split("jk=")[1]?.split("&")[0] ||
                  "",
                title: titleElement.innerText.trim(),
                company: companyElement?.textContent?.trim() || "Unknown",
                location: locationElement?.textContent?.trim() || "Unknown",
                url: titleElement.href,
                description: "",
                source: "Indeed",
                salary: salaryElement?.textContent?.trim(),
                postedDate: dateElement?.textContent?.trim(),
                applied: false,
              });
            }
          });

          return results;
        });

        // Filter out duplicate jobs
        const newJobs = jobs.filter((job) => {
          if (seenJobIds.has(job.id)) {
            return false;
          }
          seenJobIds.add(job.id);
          return true;
        });

        // Filter jobs by date and check if we should stop pagination
        const filteredJobs: Job[] = [];
        let hasDateInfo = false;

        for (const job of newJobs) {
          const daysOld = this.parseJobAge(job.postedDate);

          if (daysOld !== null) {
            hasDateInfo = true;
            console.log(
              `Job "${job.title}" - posted: "${job.postedDate}" (${daysOld} days old)`,
            );
          }

          if (daysOld !== null && daysOld > maxDaysOld) {
            console.log(
              `Job "${job.title}" is ${daysOld} days old, exceeds ${maxDaysOld} day threshold - stopping pagination`,
            );
            shouldStopPagination = true;
            break;
          }

          if (daysOld === null || daysOld <= maxDaysOld) {
            filteredJobs.push(job);
          }
        }

        if (!hasDateInfo && newJobs.length > 0) {
          console.log(
            `Warning: No date information found for jobs on page ${pageNum + 1}`,
          );
        }

        console.log(
          `Found ${filteredJobs.length} jobs within ${maxDaysOld} days on page ${pageNum + 1}`,
        );
        allJobs.push(...filteredJobs);

        // Stop if we hit the date threshold
        if (shouldStopPagination) {
          console.log(
            `Reached jobs older than ${maxDaysOld} days, stopping pagination`,
          );
          break;
        }

        // If we got fewer jobs than expected, we've reached the end
        if (jobs.length < 10) {
          console.log(
            `Fewer than 10 jobs found on page ${pageNum + 1}, stopping pagination`,
          );
          break;
        }
      }

      console.log(
        `Total jobs found within ${maxDaysOld} days: ${allJobs.length}`,
      );
      return allJobs;
    } catch (error) {
      console.error("Failed to search jobs:", error);
      return allJobs.length > 0 ? allJobs : [];
    }
  }

  async getJobDetails(page: Page, job: Job): Promise<Job> {
    try {
      await page.goto(job.url, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      await page.waitForTimeout(1000);

      const description = await page.evaluate(() => {
        const descElement = document.querySelector(
          "#jobDescriptionText, .jobsearch-jobDescriptionText",
        );
        return descElement?.textContent?.trim() || "";
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
      await page.goto(job.url, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      await page.waitForTimeout(2000);

      // Look for "Apply now" button
      const applyButton = await page.$(
        'button:has-text("Apply now"), .indeed-apply-button, [id*="apply"]',
      );

      if (!applyButton) {
        console.log(
          "No direct apply button found - job may require external application",
        );
        return false;
      }

      await applyButton.click();
      await page.waitForTimeout(2000);

      // Handle resume upload if needed
      const uploadInput = await page.$('input[type="file"]');
      if (uploadInput && this.config.paths.resume) {
        await uploadInput.setInputFiles(this.config.paths.resume);
        console.log("Resume uploaded");
      }

      // Submit application (this will vary by Indeed's current UI)
      const submitButton = await page.$(
        'button:has-text("Submit"), button:has-text("Continue")',
      );
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

  private buildSearchUrl(
    keyword: string,
    location?: string,
    radius?: number,
    start?: number,
  ): string {
    const params = new URLSearchParams({
      q: keyword,
      l: location ?? this.config.jobSearch.location,
      radius: (radius ?? this.config.jobSearch.radius).toString(),
    });

    // Add Indeed's native date filter (fromage parameter)
    // This filters at the Indeed level, which is more reliable
    const maxDaysOld = this.config.jobSearch.maxDaysOld;
    if (maxDaysOld && maxDaysOld > 0) {
      params.set("fromage", maxDaysOld.toString());
    }

    // Add start parameter for pagination (0, 10, 20, 30...)
    if (start && start > 0) {
      params.set("start", start.toString());
    }

    return `${this.baseUrl}/jobs?${params.toString()}`;
  }

  /**
   * Parse job age from Indeed's date strings
   * Examples: "Just posted", "Today", "1 day ago", "2 days ago", "30+ days ago"
   * Returns null if unable to parse
   */
  private parseJobAge(dateString?: string): number | null {
    if (!dateString) {
      return null;
    }

    const lowerDate = dateString.toLowerCase().trim();

    // Just posted or Today = 0 days
    if (lowerDate.includes("just posted") || lowerDate === "today") {
      return 0;
    }

    // "1 day ago", "2 days ago", etc.
    const daysMatch = lowerDate.match(/(\d+)\s+days?\s+ago/);
    if (daysMatch) {
      return parseInt(daysMatch[1], 10);
    }

    // "30+ days ago" - treat as 30 days
    const plusDaysMatch = lowerDate.match(/(\d+)\+\s+days?\s+ago/);
    if (plusDaysMatch) {
      return parseInt(plusDaysMatch[1], 10);
    }

    // If we can't parse it, return null (don't filter it out)
    return null;
  }

  private async loginWithGoogle(page: Page): Promise<boolean> {
    if (!this.config.google.email || !this.config.google.password) {
      console.error("Google credentials are not set in config");
      return false;
    }

    try {
      const googleButtonSelector =
        'button:has-text("Continue with Google"), a:has-text("Continue with Google")';

      const [popup] = await Promise.all([
        page.waitForEvent("popup"),
        page.click(googleButtonSelector),
      ]);

      await popup.waitForLoadState("domcontentloaded");

      // Enter email
      await popup.fill('input[type="email"]', this.config.google.email);
      await popup.click('#identifierNext, button:has-text("Next")');
      await popup.waitForTimeout(1500);

      // Enter password
      await popup.fill('input[type="password"]', this.config.google.password);
      await popup.click('#passwordNext, button:has-text("Next")');

      // Wait for the popup to close or redirect back
      await popup.waitForLoadState("domcontentloaded");

      // Give main page time to reflect login status
      await page.waitForLoadState("domcontentloaded");

      console.log("Successfully logged in to Indeed via Google");
      return true;
    } catch (error) {
      console.error("Google login failed:", error);
      return false;
    }
  }
}
