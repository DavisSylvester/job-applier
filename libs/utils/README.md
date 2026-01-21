# @job-applier/utils

Shared utilities for the job-applier monorepo.

## Features

### Logger

Winston-based logger with file and console transports.

#### Usage

```typescript
import { logger } from "@job-applier/utils";

logger.info("Application started");
logger.warn("This is a warning");
logger.error("An error occurred", { error: err });
logger.debug("Debug information");
```

#### Configuration

Set the `LOG_LEVEL` environment variable to control logging:
- `error`: Only errors
- `warn`: Warnings and errors
- `info`: Info, warnings, and errors (default)
- `debug`: All messages including debug

#### Output

Logs are written to:
- Console (with colors)
- `logs/error.log` (errors only)
- `logs/combined.log` (all levels)

#### Stream for HTTP Middleware

```typescript
import { loggerStream } from "@job-applier/utils";

// Use with Express/Morgan
app.use(morgan("combined", { stream: loggerStream }));
```
