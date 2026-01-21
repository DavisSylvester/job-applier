# @job-applier/interfaces

Shared TypeScript interfaces for the Job Applier monorepo.

## Exports

### Job
Represents a job listing with all relevant information.

### ApplicationResult
Represents the result of a job application attempt.

### ProxyConfig
Configuration for proxy servers.

### JobBoardService
Interface that all job board integrations must implement.

## Usage

```typescript
import type { Job, ApplicationResult } from "@job-applier/interfaces";

const job: Job = {
  id: "123",
  title: "Software Engineer",
  company: "Example Corp",
  // ... other fields
};
```
