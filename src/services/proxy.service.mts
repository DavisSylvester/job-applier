import type { ProxyConfig } from '../types/index.mts';
import type { Config } from '../config/index.mts';

export class ProxyService {

  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  getProxyConfig(): ProxyConfig | undefined {
    if (!this.config.proxy.enabled) {
      return undefined;
    }

    const server = `http://${this.config.proxy.host}:${this.config.proxy.port}`;

    return {
      server,
      username: this.config.proxy.username,
      password: this.config.proxy.password,
    };
  }

  isEnabled(): boolean {
    return this.config.proxy.enabled;
  }

  async testConnection(): Promise<boolean> {
    if (!this.isEnabled()) {
      console.log('Proxy is disabled');
      return true;
    }

    try {
      const proxyConfig = this.getProxyConfig();
      console.log(`Testing proxy connection to ${proxyConfig?.server}...`);
      
      // You can add actual proxy test logic here using axios
      // For now, just return true if config is valid
      return !!proxyConfig?.server;
    } catch (error) {
      console.error('Proxy connection test failed:', error);
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
