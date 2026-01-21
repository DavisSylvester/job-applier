# Smart Proxy Setup Guide

This guide explains how to configure smart proxy rotation to avoid bot detection and enable successful pagination through job search results.

## What is Smart Proxy?

Smart Proxy is a proxy service that automatically rotates IP addresses for each request or session. This helps bypass rate limiting and bot detection mechanisms used by websites like Indeed.

## Supported Proxy Services

### 1. **Bright Data (formerly Luminati)**
- URL: https://brightdata.com
- Format: `brd.superproxy.io:22225`
- Username format: `username-session-{sessionId}`

### 2. **Smartproxy**
- URL: https://smartproxy.com
- Format: `gate.smartproxy.com:7000`
- Username format: `username-session-{sessionId}`

### 3. **Oxylabs**
- URL: https://oxylabs.io
- Format: `pr.oxylabs.io:7777`
- Username format: `customer-username-sessid-{sessionId}`

### 4. **IPRoyal**
- URL: https://iproyal.com
- Format: `geo.iproyal.com:12321`
- Username format: `username-session-{sessionId}`

## Environment Configuration

Add the following environment variables to your `.env` file:

```bash
# Enable proxy
USE_PROXY=true

# Enable smart proxy rotation
SMART_PROXY=true

# Proxy server details
PROXY_HOST=gate.smartproxy.com
PROXY_PORT=7000

# Your proxy credentials
PROXY_USERNAME=your-username
PROXY_PASSWORD=your-password

# Optional: Custom rotation URL for advanced setups
# PROXY_ROTATION_URL=https://api.example.com/rotate
```

## How It Works

1. **Session-Based Rotation**: Each pagination request uses a different session ID
2. **Automatic IP Rotation**: The proxy service assigns a different IP for each session
3. **Sticky Sessions**: Within a session, the same IP is used for consistency
4. **Human-Like Delays**: Random delays between 5-8 seconds after proxy rotation

## Configuration Example

### Basic Setup (Smartproxy)

```bash
USE_PROXY=true
SMART_PROXY=true
PROXY_HOST=gate.smartproxy.com
PROXY_PORT=7000
PROXY_USERNAME=sp12345678
PROXY_PASSWORD=your_password_here
```

### Advanced Setup (Bright Data)

```bash
USE_PROXY=true
SMART_PROXY=true
PROXY_HOST=brd.superproxy.io
PROXY_PORT=22225
PROXY_USERNAME=brd-customer-hl_12345678
PROXY_PASSWORD=your_password_here
```

## Testing Proxy Connection

You can test your proxy configuration before running the job scraper:

```bash
# Test without proxy
bun test

# Test with proxy enabled
USE_PROXY=true SMART_PROXY=true bun test
```

## Pagination with Smart Proxy

The service automatically:
- Rotates the proxy between page requests
- Adds random delays (5-8 seconds) after rotation
- Maintains up to 3 retry attempts per page
- Gracefully handles proxy failures

## Pricing Considerations

Smart proxy services typically charge based on:
- **Traffic**: $5-15 per GB
- **Requests**: $0.001-0.01 per request
- **Concurrent Sessions**: $50-500 per month

For job scraping:
- ~1-2 MB per Indeed page
- ~100-200 pages per month = $1-5/month

## Troubleshooting

### Proxy Connection Fails
```
Error: net::ERR_PROXY_CONNECTION_FAILED
```
**Solution**: Verify PROXY_HOST, PROXY_PORT, and credentials

### Still Getting Blocked
```
Error: net::ERR_ABORTED at https://www.indeed.com
```
**Solutions**:
1. Increase delay between pages (edit `searchJobs` method)
2. Reduce `maxPages` to 1-2
3. Use residential proxies instead of datacenter proxies
4. Enable headless: false to see what Indeed displays

### Slow Performance
```
Taking too long to scrape pages
```
**Solutions**:
1. Reduce delays in `searchJobs` method
2. Use fewer pages per search
3. Upgrade to faster proxy service

## Best Practices

1. **Start Small**: Test with 1-2 pages before scaling
2. **Monitor Costs**: Track proxy usage to avoid unexpected charges
3. **Respect Rate Limits**: Add appropriate delays between requests
4. **Use Residential IPs**: They're less likely to be blocked than datacenter IPs
5. **Rotate User Agents**: Combined with IP rotation for best results

## Code Example

```typescript
// Enable smart proxy rotation
const config = loadConfig();
const browserService = new BrowserService(config);
const indeedService = new IndeedService(config, browserService);

// Search with pagination (uses proxy rotation automatically)
const jobs = await indeedService.searchJobs(page, 'nodejs', {
  location: 'Dallas, TX',
  radius: 100,
  maxPages: 3 // Will rotate proxy for pages 2 and 3
});
```

## Additional Resources

- [Bright Data Documentation](https://docs.brightdata.com/)
- [Smartproxy Documentation](https://help.smartproxy.com/)
- [Oxylabs Documentation](https://developers.oxylabs.io/)
- [IPRoyal Documentation](https://iproyal.com/documentation/)
