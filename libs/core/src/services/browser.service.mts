import { chromium, type Browser, type Page } from "playwright";
import type { Config } from "@job-applier/config";
import { ProxyService } from "./proxy.service.mts";

export class BrowserService {
  private config: Config;
  private proxyService: ProxyService;
  private browser: Browser | null = null;

  constructor(config: Config, proxyService?: ProxyService) {
    this.config = config;
    this.proxyService = proxyService || new ProxyService(config);
  }

  getProxyService(): ProxyService {
    return this.proxyService;
  }

  async launch(): Promise<Browser> {
    const proxyConfig = this.proxyService.getProxyConfig();

    const browserOptions: Parameters<typeof chromium.launch>[0] = {
      headless: this.config.application.headless,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-blink-features=AutomationControlled",
      ],
    };

    if (proxyConfig) {
      browserOptions.proxy = proxyConfig;
      console.log(`Launching browser with proxy: ${proxyConfig.server}`);
    }

    this.browser = await chromium.launch(browserOptions);
    return this.browser;
  }

  async createPage(): Promise<Page> {
    if (!this.browser) {
      await this.launch();
    }

    const page = await this.browser!.newPage({
      viewport: { width: 1920, height: 1080 },
      userAgent:
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      extraHTTPHeaders: {
        "Accept-Language": "en-US,en;q=0.9",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
      },
    });

    // Add comprehensive stealth techniques to avoid detection
    await page.addInitScript(() => {
      // Override the navigator.webdriver property
      Object.defineProperty(navigator, "webdriver", {
        get: () => undefined,
      });

      // Mock chrome runtime
      (window as any).chrome = {
        runtime: {},
      };

      // Override plugins to make it look real
      Object.defineProperty(navigator, "plugins", {
        get: () => [
          {
            name: "Chrome PDF Plugin",
            filename: "internal-pdf-viewer",
            description: "Portable Document Format",
          },
          {
            name: "Chrome PDF Viewer",
            filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai",
            description: "",
          },
          {
            name: "Native Client",
            filename: "internal-nacl-plugin",
            description: "",
          },
        ],
      });

      // Override languages
      Object.defineProperty(navigator, "languages", {
        get: () => ["en-US", "en"],
      });

      // Add permissions
      const originalQuery = (window.navigator as any).permissions.query;
      (window.navigator as any).permissions.query = (parameters: any) =>
        parameters.name === "notifications"
          ? Promise.resolve({ state: Notification.permission as any })
          : originalQuery(parameters);

      // Override platform inconsistencies
      Object.defineProperty(navigator, "platform", {
        get: () => "Linux x86_64",
      });

      // Mock proper hardware concurrency
      Object.defineProperty(navigator, "hardwareConcurrency", {
        get: () => 8,
      });

      // Add device memory
      Object.defineProperty(navigator, "deviceMemory", {
        get: () => 8,
      });
    });

    return page;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  getBrowser(): Browser | null {
    return this.browser;
  }
}
