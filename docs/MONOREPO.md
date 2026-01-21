# Job Applier Monorepo

Automated job application system built with Bun, TypeScript, and a monorepo architecture.

## 📁 Structure

This project is organized as a Bun monorepo with the following structure:

```
job-applier/
├── apps/
│   └── job-applier/          # Main application
│       ├── src/              # Application source code
│       ├── docs/             # Documentation
│       └── tests/            # Application tests
├── libs/
│   ├── config/               # Shared configuration package
│   │   └── src/
│   │       └── index.mts     # Config loading and validation
│   ├── interfaces/           # Shared TypeScript interfaces
│   │   └── src/
│   │       ├── job.mts
│   │       ├── application-result.mts
│   │       ├── proxy-config.mts
│   │       └── job-board-service.mts
│   └── core/                 # Core business logic library
│       └── src/
│           ├── services/     # Business services
│           ├── repositories/ # Data access layer
│           └── models/       # Database models
└── ui/                       # Future UI applications

```

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.0.0
- MongoDB Atlas account (or local MongoDB)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd job-applier
```

2. Install dependencies (Bun will automatically use workspace catalogs):
```bash
bun install
```

3. Set up environment variables:
Create a `.env` file in the root directory with your configuration (see `.env.example`).

## 📦 Dependency Management with Catalogs

This project uses [Bun's catalog feature](https://bun.sh/docs/pm/catalogs) to manage shared dependencies across all packages. This ensures consistency and makes version updates simple.

### How It Works

The root `package.json` defines catalogs for common dependencies:

```json
{
  "workspaces": {
    "packages": ["apps/*", "libs/*", "ui/*"],
    "catalog": {
      "dotenv": "^16.3.1",
      "zod": "^3.22.4",
      "axios": "^1.6.2"
      // ... other shared dependencies
    },
    "catalogs": {
      "dev": {
        "@types/bun": "latest",
        "typescript": "^5.3.3"
        // ... development dependencies
      }
    }
  }
}
```

Packages reference these versions using `catalog:` protocol:

```json
{
  "dependencies": {
    "zod": "catalog:",           // Uses default catalog
    "typescript": "catalog:dev"  // Uses named 'dev' catalog
  }
}
```

### Updating Dependencies

To update a dependency version across all packages:

1. Update the version in root `package.json` catalogs
2. Run `bun install`
3. All packages using that catalog entry will be updated automatically!

### Development

Run the application in development mode:
```bash
bun dev
```

Run the application:
```bash
bun start
```

Run linting across all workspaces:
```bash
bun lint
# or explicitly: bun run --workspaces lint
```

Run tests:
```bash
bun test
```

Build all workspaces:
```bash
bun build
# or explicitly: bun run --workspaces build
```

Clean all build artifacts and node_modules:
```bash
bun clean
```

### Working with Specific Packages

```bash
# Run a script in a specific package
bun run --filter @job-applier/core test

# Run in multiple packages matching a pattern
bun run --filter "pkg-*" build

# Exclude specific packages
bun run --filter "pkg-*" --filter "!pkg-c" test
```

## 📦 Packages

### @job-applier/app
Main application that orchestrates job searching and application submission.

### @job-applier/config
Shared configuration package using Zod for validation. Handles loading and parsing environment variables.

### @job-applier/interfaces
TypeScript interfaces and types shared across the monorepo.

### @job-applier/core
Core business logic library containing:
- **Services**: Browser automation, database, job board integrations, proxy management
- **Repositories**: Data access layer for MongoDB
- **Models**: Mongoose schemas for data persistence

## 🏗️ Architecture

This monorepo follows a clean architecture pattern:

1. **Apps Layer**: Entry points for different applications (CLI, API, etc.)
2. **Core Layer**: Business logic, services, and data access
3. **Shared Layer**: Configuration, interfaces, and utilities

### Workspace Dependencies

Packages use `workspace:*` protocol for internal dependencies, ensuring the latest local version is always used during development.

## 🔧 Development Workflow

### Adding a New Package

1. Create a new directory in `libs/` or `apps/`
2. Add a `package.json` with appropriate workspace dependencies
3. Add a `tsconfig.json` extending the base configuration
4. Update the root `package.json` workspace configuration if needed

### Working on Multiple Packages

Bun workspaces automatically link packages. Changes in one package are immediately available to dependent packages without rebuilding.

### Running Scripts in Specific Packages

```bash
# Run a script in a specific package
bun run --filter @job-applier/core test

# Run a script in all packages
bun run --filter '*' build
```

## 🧪 Testing

Tests are organized within each package:
- Unit tests alongside source files
- Integration tests in dedicated `tests/` directories

## 📝 License

[Your License]

## 🤝 Contributing

Contributions are welcome! Please follow the existing code structure and conventions.
