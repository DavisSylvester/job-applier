# Indeed Job Applier

An automated job application system built with Bun and TypeScript that searches for jobs on Indeed and applies on your behalf using browser automation with proxy support.

## 🚀 Features

- **Automated Job Search**: Search for jobs using multiple keywords
- **Auto-Apply**: Automatically apply to jobs that match your criteria
- **Proxy Support**: Built-in support for reverse proxy services (Decodio or similar)
- **Browser Automation**: Uses Playwright for realistic browser interactions
- **Anti-Detection**: Includes stealth techniques to avoid bot detection
- **Daily Limits**: Configurable application limits per day
- **Dry Run Mode**: Test the system without actually applying
- **Application Tracking**: Stores all applications and job data locally
- **Resume Upload**: Automatically uploads your resume when needed

## 📋 Prerequisites

- [Bun](https://bun.sh/) installed on your system
- Indeed account credentials
- Resume in PDF format
- (Optional) Proxy service credentials (e.g., Decodio)

## 🛠️ Installation

1. Install dependencies:
```bash
bun install
```

2. Install Playwright browsers:
```bash
bunx playwright install chromium
```

3. Create your `.env` file:
```bash
cp .env.example .env
```

4. Edit `.env` with your credentials and preferences:
```env
INDEED_EMAIL=your-email@example.com
INDEED_PASSWORD=your-password

# Proxy Configuration
PROXY_HOST=proxy.decodio.com
PROXY_PORT=8080
USE_PROXY=true

# Job Search
JOB_SEARCH_KEYWORDS=software engineer,developer
JOB_LOCATION=Remote
JOB_RADIUS=50

# Application Settings
AUTO_APPLY=true
DRY_RUN=false
MAX_APPLICATIONS_PER_DAY=10
HEADLESS=false

# Resume
RESUME_PATH=./data/resume.pdf
```

5. Add your resume to the `data` folder:
```bash
mkdir -p data
cp /path/to/your/resume.pdf data/resume.pdf
```

## 🎮 Usage

### Development Mode (with auto-reload):
```bash
bun run dev
```

### Production Mode:
```bash
bun start
```

### Dry Run (test without applying):
```bash
# Set DRY_RUN=true in .env, then:
bun start
```

## ⚙️ Configuration

### Proxy Settings

The application supports reverse proxy services like Decodio. Configure in `.env`:

```env
PROXY_HOST=your-proxy-host.com
PROXY_PORT=8080
PROXY_USERNAME=optional
PROXY_PASSWORD=optional
USE_PROXY=true
```

### Job Search Criteria

```env
JOB_SEARCH_KEYWORDS=software engineer,full stack developer,backend developer
JOB_LOCATION=San Francisco, CA
JOB_RADIUS=25
```

### Application Limits

```env
MAX_APPLICATIONS_PER_DAY=10
AUTO_APPLY=true
DRY_RUN=false
HEADLESS=false  # Set to true to hide browser window
```

## 📁 Project Structure

```
job-applier/
├── src/
│   ├── config/          # Configuration management
│   ├── services/        # Core services
│   │   ├── browser.service.mts
│   │   ├── indeed.service.mts
│   │   ├── proxy.service.mts
│   │   └── storage.service.mts
│   ├── types/           # TypeScript type definitions
│   └── index.mts        # Main application entry
├── data/                # Local data storage
│   ├── resume.pdf       # Your resume
│   ├── jobs.json        # Job listings
│   └── applications.json # Application history
├── .env                 # Environment configuration
└── package.json
```

## 🔒 Security & Privacy

- **Credentials**: Never commit your `.env` file
- **Data**: All job and application data is stored locally
- **Proxy**: Use a reputable proxy service to protect your IP
- **Rate Limiting**: Built-in delays between applications to avoid detection
- **Stealth Mode**: Includes anti-bot detection measures

## ⚠️ Important Notes

1. **Terms of Service**: Ensure your usage complies with Indeed's Terms of Service
2. **Rate Limits**: Respect daily application limits to avoid account suspension
3. **Accuracy**: Always review applications before enabling auto-apply
4. **Testing**: Use dry-run mode extensively before enabling real applications
5. **Monitoring**: Check the application regularly to ensure it's working correctly

## 🐛 Troubleshooting

### Proxy Connection Issues
```bash
# Test your proxy connection
bun run src/services/proxy.service.mts
```

### Browser Issues
```bash
# Reinstall Playwright browsers
bunx playwright install --force chromium
```

### Login Failures
- Check your Indeed credentials in `.env`
- Indeed may require CAPTCHA or 2FA - handle manually if needed
- Try setting `HEADLESS=false` to see what's happening

## 📝 License

MIT

## ⚖️ Disclaimer

This tool is for educational purposes. Users are responsible for ensuring their use complies with Indeed's Terms of Service and applicable laws. Automated job applications may violate platform policies.
