# @job-applier/config

Shared configuration package for the Job Applier monorepo.

## Features

- Environment variable loading and validation using Zod
- Type-safe configuration access
- Centralized configuration management

## Usage

```typescript
import { loadConfig, type Config } from "@job-applier/config";

const config = loadConfig();
console.log(config.indeed.email);
```

## Configuration Schema

The package validates the following configuration:

- `indeed`: Indeed credentials and auth provider
- `proxy`: Proxy settings and smart proxy configuration
- `jobSearch`: Search keywords, location, and filters
- `application`: Application behavior settings
- `paths`: File paths for resume and cover letter
- `google`: Google authentication credentials
- `mongodb`: MongoDB connection settings
