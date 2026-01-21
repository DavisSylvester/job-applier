# Quick Reference: Old vs New Structure

## File Locations

| Old Location | New Location | Package |
|-------------|--------------|---------|
| `src/index.mts` | `apps/job-applier/src/index.mts` | @job-applier/app |
| `src/config/index.mts` | `libs/config/src/index.mts` | @job-applier/config |
| `src/interfaces/*.mts` | `libs/interfaces/src/*.mts` | @job-applier/interfaces |
| `src/services/*.mts` | `libs/core/src/services/*.mts` | @job-applier/core |
| `src/repositories/*.mts` | `libs/core/src/repositories/*.mts` | @job-applier/core |
| `src/models/*.mts` | `libs/core/src/models/*.mts` | @job-applier/core |
## Import Changes

### Config
```typescript
// Old
import { loadConfig } from "./config/index.mts";

// New
import { loadConfig } from "@job-applier/config";
```

### Interfaces
```typescript
// Old
import type { Job } from "./interfaces/job.mts";
import type { ApplicationResult } from "./interfaces/application-result.mts";

// New
import type { Job, ApplicationResult } from "@job-applier/interfaces";
```

### Services
```typescript
// Old
import { BrowserService } from "./services/browser.service.mts";
import { IndeedService } from "./services/indeed.service.mts";

// New
import { BrowserService, IndeedService } from "@job-applier/core";
// or specifically from services
import { BrowserService } from "@job-applier/core/services";
```

### Repositories
```typescript
// Old
import { JobRepository } from "./repositories/job.repository.mts";

// New
import { JobRepository } from "@job-applier/core";
// or specifically
import { JobRepository } from "@job-applier/core/repositories";
```

## Command Changes

| Old Command | New Command | Notes |
|------------|-------------|-------|
| `bun run src/index.mts` | `bun start` | Runs main app |
| `bun run --watch src/index.mts` | `bun dev` | Dev mode with watch |
| `eslint src/**/*.mts` | `bun lint` | Lints all packages |
| `bun build src/index.mts --outdir ./dist` | `bun build` | Builds all packages |

## Package Scripts

### Running Specific Package Scripts

```bash
# Old: Everything was at root
bun test

# New: Run in specific package
bun run --filter @job-applier/core test
bun run --filter @job-applier/app dev

# Or run in all packages
bun run --filter '*' test
```

## Development Workflow

### Old Workflow
1. Edit files in `src/`
2. Run `bun run --watch src/index.mts`
3. All code in one directory

### New Workflow
1. Edit files in appropriate package:
   - Config changes → `libs/config/`
   - Interface changes → `libs/interfaces/`
   - Service changes → `libs/core/`
   - App logic → `apps/job-applier/`
2. Run `bun dev` from root
3. Changes in packages are instantly available (linked via workspaces)

## Adding New Features

### Old Way
```
src/
├── services/
│   └── new-service.mts  ← Add here
```

### New Way - Add to Core Package
```
libs/core/src/
├── services/
│   └── new-service.mts  ← Add here
└── index.mts            ← Export from here
```

### New Way - Add New App
```
apps/
├── job-applier/
└── new-app/             ← Create new app
    ├── package.json
    ├── src/
    └── tsconfig.json
```

## Testing

### Old
```bash
# Tests were in root tests/ directory
bun test
```

### New
```bash
# Tests are in each package
bun test                              # Run all tests
bun run --filter @job-applier/core test   # Test specific package
```

## Configuration Files

### Duplicated in Each Package
- `package.json` - Package-specific dependencies and scripts
- `tsconfig.json` - TypeScript configuration with path mappings
- `eslint.config.mjs` - ESLint configuration
- `README.md` - Package documentation

### Shared at Root
- `.env` - Environment variables (loaded by app)
- `eslint.config.mjs` - Root ESLint config (template)
- `tsconfig.json` - Root TypeScript config with project references

## Benefits Summary

| Aspect | Old | New |
|--------|-----|-----|
| Structure | Flat, everything in src/ | Organized by concern |
| Reusability | Hard to reuse code | Packages can be imported anywhere |
| Testing | All tests together | Tests per package |
| Scaling | Difficult | Easy to add apps/packages |
| Type Safety | Local only | Across all packages |
| Build Times | Build everything | Can build specific packages |

## Common Tasks

### Add a New Service
1. Create file in `libs/core/src/services/new-service.mts`
2. Export from `libs/core/src/services/index.mts`
3. Use in app: `import { NewService } from "@job-applier/core"`

### Add a New Interface
1. Create file in `libs/interfaces/src/new-interface.mts`
2. Export from `libs/interfaces/src/index.mts`
3. Use anywhere: `import type { NewInterface } from "@job-applier/interfaces"`

### Add a New App
1. Create directory in `apps/new-app/`
2. Add `package.json` with workspace dependencies
3. Add `src/index.mts` as entry point
4. Add script to root `package.json`

### Update Dependencies
```bash
# Add to specific package
cd libs/core
bun add some-package

# Or from root
bun add some-package --filter @job-applier/core
```

## Troubleshooting

### Types Not Found
- Check `tsconfig.json` paths configuration
- Run `bun install` to ensure workspaces are linked
- Verify package exports in `package.json`

### Import Errors
- Use workspace package names: `@job-applier/config` not `./config`
- Check that package is listed in dependencies
- Ensure package.json exports field is correct

### Lint Failures
- Each package needs `eslint.config.mjs`
- Run `bun lint` from root to see all errors
- Use `--filter` to lint specific package
