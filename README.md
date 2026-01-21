# Job Applier

> Automated job application system built with Bun, TypeScript, and MongoDB using modern monorepo architecture.

This project has been migrated to a Bun monorepo structure following [official Bun best practices](https://bun.sh/docs/pm/workspaces).

## ⚡ Quick Start

```bash
# Install dependencies (uses Bun's catalog system)
bun install

# Set up environment variables
cp .env.example .env

# Run the application
bun start

# Development mode with auto-reload
bun dev
```

## 📦 Monorepo Structure

This is a Bun workspace monorepo with the following packages:

- **apps/job-applier**: Main application
- **libs/config**: Shared configuration with Zod validation
- **libs/interfaces**: TypeScript interfaces and types
- **libs/core**: Core business logic (services, repositories, models)

See [docs/MONOREPO.md](./docs/MONOREPO.md) for detailed documentation.

## ✨ Key Features

- 🤖 Automated job searching on Indeed
- 📝 Smart application submission
- 🔄 Proxy support with intelligent rotation
- 💾 MongoDB persistence
- 🎭 Stealth browser automation
- 📊 Application tracking and statistics
- 📦 Monorepo architecture with shared packages
- ⚡ Blazing fast installs with Bun catalogs

## 🎯 Bun Workspace Features

This project uses Bun's advanced workspace features:

### Catalogs for Dependency Management
Dependencies are managed through catalogs for consistency:

```json
{
  "workspaces": {
    "catalog": {
      "zod": "^3.22.4",
      "axios": "^1.6.2"
    }
  }
}
```

Packages reference catalogs:
```json
{
  "dependencies": {
    "zod": "catalog:"  // Uses version from root catalog
  }
}
```

**Benefits:**
- ✅ Update versions in one place
- ✅ Guaranteed consistency across packages
- ✅ 28x faster than npm install
- ✅ Simplified dependency management

See [docs/BUN_BEST_PRACTICES.md](./docs/BUN_BEST_PRACTICES.md) for details.

## 📖 Documentation

- [docs/MONOREPO.md](./docs/MONOREPO.md) - Comprehensive monorepo guide
- [docs/BUN_BEST_PRACTICES.md](./docs/BUN_BEST_PRACTICES.md) - Bun workspace patterns
- [docs/BUN_UPDATES.md](./docs/BUN_UPDATES.md) - Recent updates applied
- [docs/MIGRATION_SUMMARY.md](./docs/MIGRATION_SUMMARY.md) - Migration details
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - System architecture
- [docs/QUICK_REFERENCE.md](./docs/QUICK_REFERENCE.md) - Quick reference guide

## 🚀 Available Commands

```bash
# Run commands
bun start              # Run the application
bun dev                # Development mode with watch

# Development
bun lint               # Lint all workspaces
bun test               # Run all tests
bun build              # Build all workspaces
bun clean              # Clean build artifacts

# Package-specific commands
bun run --filter @job-applier/core test    # Test specific package
bun run --filter @job-applier/app dev      # Run specific package
```

## 🏗️ Project Structure

```
job-applier/
├── apps/
│   └── job-applier/          # Main application
├── libs/
│   ├── config/               # Configuration (@job-applier/config)
│   ├── interfaces/           # TypeScript types (@job-applier/interfaces)
│   └── core/                 # Business logic (@job-applier/core)
├── package.json              # Root with workspace config & catalogs
└── bun.lock                  # Lockfile with catalog info
```

## 🔧 Adding Dependencies

### To a specific package:
```bash
# Option 1: Add to catalog (for shared dependencies)
# Edit root package.json catalog, then:
bun install

# Option 2: Add directly to package
cd libs/core
bun add some-package
```

### Update catalog versions:
```bash
# Edit root package.json
"catalog": {
  "axios": "^1.7.0"  // Updated
}

# Reinstall to apply changes
bun install
```

All packages using `"axios": "catalog:"` will automatically use the new version!

## 🎓 Learning Resources

- [Bun Documentation](https://bun.sh/docs)
- [Bun Workspaces Guide](https://bun.sh/docs/pm/workspaces)
- [Bun Catalogs Guide](https://bun.sh/docs/pm/catalogs)

## License

[Your License]
