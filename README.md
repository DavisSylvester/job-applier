# Indeed Job Applier

An automated job application system built with Bun and TypeScript that searches for jobs on Indeed and applies on your behalf using browser automation with proxy support.

## 🚀 Features

- **Automated Job Search**: Search for jobs using multiple keywords
- **Auto-Apply**: Automatically apply to jobs that match your criteria
- **MongoDB Storage**: Store and track all found jobs in MongoDB database
- **Smart Proxy Support**: Session-based IP rotation for bypassing detection
- **Date Filtering**: Only show jobs posted within the last N days
- **Browser Automation**: Uses Playwright for realistic browser interactions
- **Anti-Detection**: Includes stealth techniques to avoid bot detection
- **Daily Limits**: Configurable application limits per day
- **Dry Run Mode**: Test the system without actually applying
- **Application Tracking**: Stores all applications and job data
- **Resume Upload**: Automatically uploads your resume when needed

## 📋 Prerequisites

- [Bun](https://bun.sh/) installed on your system
- Indeed account credentials
- MongoDB Atlas account or MongoDB instance
- Resume in PDF format
- (Optional) Smart Proxy service credentials (Smartproxy, Bright Data, etc.)

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
MongoDB Configuration
MONGO_USERNAME=your-mongodb-username
MONGO_PASSWORD=your-mongodb-password
MONGO_HOST=mongodb.net
MONGO_CLUSTER=cluster0
MONGO_DB_NAME=job-applier

# Proxy Configuration
PROXY_HOST=proxy.example.com
PROXY_PORT=8080
USE_PROXY=true
SMART_PROXY=true

# Job Search
JOB_SEARCH_KEYWORDS=software engineer,developer
JOB_LOCATION=Remote
JOB_RADIUS=50
JOB_MAX_DAYS_OLD=5Remote
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
```bashsmart proxy services with session-based IP rotation:

```env
PROXY_HOST=your-proxy-host.com
PROXY_PORT=8080
PROXY_USERNAME=your-username
PROXY_PASSWORD=your-password
USE_PROXY=true
SMART_PROXY=true
PROXY_ROTATION_URL=https://api.example.com/rotate
```

See [docs/SMART_PROXY_SETUP.md](docs/SMART_PROXY_SETUP.md) for detailed configuration.

### MongoDB Configuration

Configure MongoDB connection for job storage:

```env
MONGO_USERNAME=your-mongodb-username
MONGO_PASSWORD=your-mongodb-password
MONGO_HOST=mongodb.net
MONGO_CLUSTER=cluster0
MONGO_DB_NAME=job-applier
```
JOB_MAX_DAYS_OLD=5
```

The `JOB_MAX_DAYS_OLD` parameter filters jobs to only show those posted within the last N days. See [docs/DATE_FILTERING.md](docs/DATE_FILTERING.md) for details.
See [docs/MONGODB_INTEGRATION.md](docs/MONGODB_INTEGRATION.md) for setup instructions.
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
database.service.mts
│   │   ├── indeed.service.mts
│   │   ├── proxy.service.mts
│   │   └── storage.service.mts
│   ├── models/          # MongoDB models
│   │   └── job.model.mts
│   ├── repositories/    # Data access layer
│   │   └── job.repository.mts
│   ├── interfaces/      # TypeScript interface definitions
│   └── index.mts        # Main application entry
├── data/                # Local data storage
│   ├── resume.pdf       # Your resume
│   ├── jobs.json        # Job listings (legacy)
│   └── applications.json # Application history
├── docs/                # Documentation
│   ├── MONGODB_INTEGRATION.md
│   ├── SMART_PROXY_SETUP.md
│   └── DATE_FILTERING.md
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
