import { describe, it, expect, test } from "bun:test";
import { loadConfig } from "../../src/config/index.mts";
import { BrowserService } from "../../src/services/browser.service.mts";
import { IndeedService } from "../../src/services/indeed.service.mts";
import { JobBoardsService } from "../../src/services/job-boards.service.mts";
import type { Config } from "../../src/config/index.mts";

const run =
  process.env.RUN_INTEGRATION === "true" ? it : (it.skip as typeof it);

describe("IndeedDecodoService integration", () => {
  test("returns jobs for NodeJS in Dallas or within 100 miles of 75495", async () => {
    // Seed minimal env so zod passes; tests do not log in.
    process.env.INDEED_EMAIL = process.env.INDEED_EMAIL || "test@example.com";
    process.env.INDEED_PASSWORD =
      process.env.INDEED_PASSWORD || "placeholder-password";
    process.env.USE_PROXY = "false";
    process.env.HEADLESS = "true";

    const config = loadConfig();
    const headlessConfig: Config = {
      ...config,
      application: { ...config.application, headless: true },
      proxy: { ...config.proxy, enabled: false },
    };

    const browserService = new BrowserService(headlessConfig);
    await browserService.launch();

    try {
      const page = await browserService.createPage();
      const indeedService = new IndeedService(headlessConfig, browserService);
      const boards = new JobBoardsService();
      boards.addBoard(indeedService);

      const jobs = await boards.searchByLocations(
        page,
        "nodejs",
        ["remote"],
        0
      );

      console.log(`Retrieved ${jobs.length} jobs from Indeed`);

      console.log("Sample jobs:", JSON.stringify(jobs, null, 2));

      // Basic assertion: we should get at least one job
      expect(Array.isArray(jobs)).toBe(true);
      expect(jobs.length).toBeGreaterThan(0);

      // Spot-check fields
      const sample = jobs[0];
      expect(typeof sample.id).toBe("string");
      expect(typeof sample.title).toBe("string");
      expect(typeof sample.company).toBe("string");
      expect(typeof sample.url).toBe("string");
    } finally {
      await browserService.close();
    }
  }, 60000);
});
