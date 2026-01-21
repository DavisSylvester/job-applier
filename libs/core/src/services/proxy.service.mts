import type { ProxyConfig } from "@job-applier/interfaces";
import type { Config } from "@job-applier/config";

export class ProxyService {
  private config: Config;
  private currentProxyIndex = 0;
  private sessionId: string;

  constructor(config: Config) {
    this.config = config;
    // Generate unique session ID for smart proxy rotation
    this.sessionId = Math.random().toString(36).substring(2, 15);
  }

  getProxyConfig(): ProxyConfig | undefined {
    if (!this.config.proxy.enabled) {
      return undefined;
    }

    // Smart Proxy: Uses session-based rotation
    if (this.config.proxy.smartProxy) {
      return this.getSmartProxyConfig();
    }

    const server = `http://${this.config.proxy.host}:${this.config.proxy.port}`;

    return {
      server,
      username: this.config.proxy.username,
      password: this.config.proxy.password,
    };
  }

  /**
   * Get Smart Proxy configuration with automatic rotation
   * Smart Proxy rotates IPs automatically for each request
   */
  private getSmartProxyConfig(): ProxyConfig {
    const server = `http://${this.config.proxy.host}:${this.config.proxy.port}`;

    // Smart Proxy username format: username-session-{sessionId}
    // This ensures IP stickiness within a session but rotates between sessions
    const username = this.config.proxy.username
      ? `${this.config.proxy.username}-session-${this.sessionId}`
      : undefined;

    return {
      server,
      username,
      password: this.config.proxy.password,
    };
  }

  /**
   * Rotate to a new proxy session
   * Call this between page loads to get a fresh IP
   */
  rotateProxy(): void {
    if (this.config.proxy.smartProxy) {
      // Generate new session ID to get a different IP
      this.sessionId = Math.random().toString(36).substring(2, 15);
      console.log(`Rotated to new proxy session: ${this.sessionId}`);
    }
  }

  /**
   * Get a fresh proxy configuration for a new request
   * This triggers IP rotation for smart proxies
   */
  getRotatedProxyConfig(): ProxyConfig | undefined {
    this.rotateProxy();
    return this.getProxyConfig();
  }

  isEnabled(): boolean {
    return this.config.proxy.enabled;
  }

  async testConnection(): Promise<boolean> {
    if (!this.isEnabled()) {
      console.log("Proxy is disabled");
      return true;
    }

    try {
      const proxyConfig = this.getProxyConfig();
      console.log(`Testing proxy connection to ${proxyConfig?.server}...`);

      // You can add actual proxy test logic here using axios
      // For now, just return true if config is valid
      return !!proxyConfig?.server;
    } catch (error) {
      console.error("Proxy connection test failed:", error);
      return false;
    }
  }

  getProxyUrl(): string | undefined {
    if (!this.isEnabled()) {
      return undefined;
    }

    const { host, port, username, password } = this.config.proxy;

    if (username && password) {
      return `http://${username}:${password}@${host}:${port}`;
    }

    return `http://${host}:${port}`;
  }
}
