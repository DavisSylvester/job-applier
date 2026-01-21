# Bun Workspace Best Practices

This document outlines how this project implements Bun workspace best practices.

## 📚 Official Documentation References

- [Bun Workspaces](https://bun.sh/docs/pm/workspaces)
- [Bun Catalogs](https://bun.sh/docs/pm/catalogs)
- [Bun Filter Flag](https://bun.sh/docs/pm/filter)

## ✅ Implemented Best Practices

### 1. Workspace Structure

Following Bun's recommended structure:
```
job-applier/
├── package.json          # Root with workspace config
├── bun.lock              # Lockfile with catalog info
└── packages/             # Workspace packages
    ├── config/
    ├── interfaces/
    └── core/
```

### 2. Catalog-Based Dependency Management

**Benefits:**
- ✅ Consistency across all packages
- ✅ Single source of truth for versions
- ✅ Easy updates (change once, update everywhere)
- ✅ Reduced lockfile conflicts

**Implementation:**

Root `package.json`:
```json
{
  "workspaces": {
    "packages": ["apps/*", "packages/*", "ui/*"],
    "catalog": {
      "zod": "^3.22.4",
      "axios": "^1.6.2"
    },
    "catalogs": {
      "dev": {
        "typescript": "^5.3.3",
        "@types/bun": "latest"
      }
    }
  }
}
```

Package `package.json`:
```json
{
  "dependencies": {
    "zod": "catalog:",           // References default catalog
    "typescript": "catalog:dev"  // References 'dev' catalog
  }
}
```

### 3. Workspace Protocol

Using `workspace:*` for internal package dependencies ensures:
- ✅ Always uses local version during development
- ✅ Automatic replacement with proper semver on publish
- ✅ Type safety across packages

Example:
```json
{
  "dependencies": {
    "@job-applier/config": "workspace:*",
    "@job-applier/core": "workspace:*"
  }
}
```

### 4. Workspace Scripts with --workspaces Flag

**Better than `--filter '*'`:**
```json
{
  "scripts": {
    "lint": "bun run --workspaces lint",
    "build": "bun run --workspaces build",
    "test": "bun run --workspaces test"
  }
}
```

The `--workspaces` flag:
- ✅ More explicit and readable
- ✅ Official Bun recommendation
- ✅ Runs scripts in parallel when possible

### 5. Glob Patterns

Supports full glob syntax including negation:
```json
{
  "workspaces": {
    "packages": [
      "apps/*",
      "packages/**",
      "!packages/**/test/**",    // Exclude test directories
      "!packages/**/template/**"  // Exclude templates
    ]
  }
}
```

### 6. Filter Flag for Selective Operations

```bash
# Run tests only in packages starting with 'pkg-'
bun run --filter "pkg-*" test

# Exclude specific packages
bun run --filter "pkg-*" --filter "!pkg-c" build

# Use paths
bun install --filter "./packages/core"

# Multiple filters work as OR
bun run --filter "@job-applier/core" --filter "@job-applier/app" test
```

## 🎯 Project-Specific Implementations

### Catalog Organization

**Default Catalog** - Production dependencies:
- `dotenv` - Environment variables
- `zod` - Runtime validation
- `axios` - HTTP client
- `mongoose` - MongoDB ODM
- `playwright` - Browser automation
- `playwright-extra` - Stealth plugins
- `puppeteer-extra-plugin-stealth` - Anti-detection

**Dev Catalog** - Development dependencies:
- `typescript` - TypeScript compiler
- `@types/bun` - Bun type definitions
- `eslint` - Linting
- `@typescript-eslint/*` - TypeScript ESLint plugins
- `@types/jest` - Jest types

### Package Scripts

Each package includes:
```json
{
  "scripts": {
    "lint": "eslint src/**/*.mts",
    "test": "bun test",
    "build": "bun build src/index.mts --outdir ./dist --target bun",
    "clean": "rm -rf dist node_modules"
  }
}
```

Root package aggregates:
```json
{
  "scripts": {
    "lint": "bun run --workspaces lint",    // Runs in all workspaces
    "test": "bun test",                      // Bun's native test runner
    "build": "bun run --workspaces build",
    "clean": "bun run --workspaces clean && rm -rf node_modules"
  }
}
```

## 🔄 Workflow Examples

### Adding a New Dependency

**To a specific package:**
```bash
# Add to default catalog (if shared)
# Edit root package.json catalog, then:
bun install

# Or add directly to package
cd packages/core
bun add some-package
```

**Update catalog version:**
```bash
# Edit root package.json
"catalog": {
  "axios": "^1.7.0"  // Updated from ^1.6.2
}

# Then reinstall
bun install
```

### Creating a New Package

1. Create package directory:
```bash
mkdir packages/new-package
```

2. Add `package.json` with catalog references:
```json
{
  "name": "@job-applier/new-package",
  "version": "1.0.0",
  "dependencies": {
    "@job-applier/interfaces": "workspace:*",
    "zod": "catalog:"
  },
  "devDependencies": {
    "typescript": "catalog:dev"
  }
}
```

3. Run `bun install`

### Running Workspace Commands

```bash
# Development
bun dev                          # Runs main app with watch
bun start                        # Runs main app

# Testing
bun test                         # Run tests in all packages
bun run --filter @job-applier/core test  # Test specific package

# Building
bun build                        # Build all packages
bun run --filter @job-applier/app build  # Build specific package

# Linting
bun lint                         # Lint all packages
bun run --filter "packages/*" lint       # Lint only packages/

# Cleaning
bun clean                        # Clean all build artifacts
```

## 📊 Performance Benefits

Bun's workspace implementation is exceptionally fast:

**Comparison (from official docs):**
- **28x faster** than `npm install`
- **12x faster** than `yarn install` (v1)
- **8x faster** than `pnpm install`

Example: The Remix monorepo installs in ~500ms with Bun.

## 🔐 Publishing Considerations

When publishing packages:

1. **Catalog references are replaced:**
   ```
   "catalog:" → "^1.0.0"
   "catalog:dev" → "^5.3.3"
   ```

2. **Workspace references are replaced:**
   ```
   "workspace:*" → "1.0.0"
   "workspace:^" → "^1.0.0"
   "workspace:~" → "~1.0.0"
   ```

3. **Use `bun pm pack` or `bun publish`:**
   ```bash
   cd packages/core
   bun pm pack  # Creates tarball with resolved versions
   ```

## 🎓 Learning Resources

- [Bun Documentation](https://bun.sh/docs)
- [Workspaces Guide](https://bun.sh/docs/pm/workspaces)
- [Catalogs Guide](https://bun.sh/docs/pm/catalogs)
- [Filter Flag Documentation](https://bun.sh/docs/pm/filter)

## 💡 Tips

1. **Use catalogs for shared dependencies** - Any dependency used in 2+ packages should be in a catalog
2. **Group catalogs by purpose** - e.g., `dev`, `testing`, `build`
3. **Use workspace:* for internal deps** - Always use workspace protocol for monorepo packages
4. **Leverage --filter for selective operations** - Don't rebuild everything when you only changed one package
5. **Keep lockfile committed** - `bun.lock` includes catalog info and ensures reproducible installs
6. **Use --workspaces flag** - More explicit than `--filter '*'`

## ✅ Checklist for New Packages

- [ ] Add to workspace pattern in root `package.json`
- [ ] Use `catalog:` for shared dependencies
- [ ] Use `catalog:dev` for dev dependencies
- [ ] Use `workspace:*` for internal packages
- [ ] Include standard scripts: lint, test, build, clean
- [ ] Add `tsconfig.json` with path mappings
- [ ] Create `README.md` with usage examples
- [ ] Add to root TypeScript project references
