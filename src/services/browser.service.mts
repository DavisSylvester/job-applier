import { chromium, type Browser, type Page } from 'playwright';
import type { Config } from '../config/index.mts';
import { ProxyService } from './proxy.service.mts';

export class BrowserService {

  private config: Config;
  private proxyService: ProxyService;
  private browser: Browser | null = null;

  constructor(config: Config) {
    this.config = config;
    this.proxyService = new ProxyService(config);
  }

  async launch(): Promise<Browser> {
    const proxyConfig = this.proxyService.getProxyConfig();

    const browserOptions: Parameters<typeof chromium.launch>[0] = {
      headless: this.config.application.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
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
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    // Add stealth techniques to avoid detection
    await page.addInitScript(() => {
      // Override the navigator.webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });

      // Override plugins to make it look real
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });

      // Override languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
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
