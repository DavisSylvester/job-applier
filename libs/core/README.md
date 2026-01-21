# @job-applier/core

Core business logic library for the Job Applier monorepo.

## Structure

### Services
- **BrowserService**: Playwright browser automation with stealth techniques
- **DatabaseService**: MongoDB connection management
- **IndeedService**: Indeed job board integration
- **IndeedDecodoService**: Enhanced Indeed search capabilities
- **JobBoardsService**: Multi-board job search orchestration
- **ProxyService**: Smart proxy rotation and management
- **StorageService**: Local file storage for jobs and applications

### Repositories
- **JobRepository**: MongoDB data access layer for jobs

### Models
- **JobModel**: Mongoose schema for job persistence

## Usage

```typescript
import {
  BrowserService,
  IndeedService,
  JobRepository,
} from "@job-applier/core";

const browserService = new BrowserService(config);
const browser = await browserService.launch();
```

## Dependencies

- `@job-applier/config`: Configuration management
- `@job-applier/interfaces`: Shared interfaces
- `playwright`: Browser automation
- `mongoose`: MongoDB ODM
