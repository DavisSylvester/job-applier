- @azure Rule - Use Azure Best Practices: When generating code for Azure, running terminal commands for Azure, or performing operations related to Azure, invoke your `azure_development-get_best_practices` tool if available.

- Strict use of Dependency Injection: Ensure all services, including authentication and API clients, are registered and resolved through the DI container. Avoid direct instantiation of services within other services.

- Repository should be used for all data layer calls
- Repository should be injected into services
- Services should not directly access the database or data layer
- Services should contain business logic and orchestrate calls to repositories and other services
- ALL DAL methods should be accessed by SERVICES only

# Elsysia Rule

- Follow Elsysia coding standards and best practices for TypeScript development.
- Ensure code quality, maintainability, and performance align with Elsysia guidelines.
- All generated code should be reviewed for compliance with Elsysia standards.
- Logic specific to Elsysia's business rules and processes should be accurately implemented.
- All api endpoints should follow Elsysia's naming conventions and response structures.
- All api endpoints should have a entry in the API documentation.
- All environment variables should be uppercase and use underscores to separate words.
- All configuration settings should be managed through dependency injection.
- Should prefer routers for segmentation of api endpoints.

# TYPESCRIPT

- Never use `any` type. Always use explicit types, interfaces, or `unknown` when type is truly unknown.
- Use strict type checking and avoid type assertions unless absolutely necessary.
- Prefer type inference where possible, but always provide explicit return types for functions.
- all interfaces should be defined in a folder named `interfaces` grouped by feature name.
- there should be ONLY one interface per file.
- All source files must use the `.mts` extension for TypeScript files.
- All import specifiers must reference `.mts` files explicitly (e.g., `import x from './file.mts'`).
- If imports use mts extension, ensure that tsconfig.json has noEmit set to true.
- Use ES module syntax (import/export) exclusively. Do not use CommonJS (require/module.exports).

## Elysia API Patterns

- Routers by domain: Group endpoints under `src/api/<domain>/router.ts` using `Elysia().group('/<domain>', ...)`. Avoid mixed-domain files.
- Schema-first validation: Require `zod` or `typebox` schemas for `body`, `query`, and `params` on every route.
- Typed responses: Define response schemas. Do not use `any` in controllers; return typed DTOs.
- OpenAPI emission: Mount `@elysiajs/swagger` and publish OpenAPI. Regenerate clients in `packages/openapi` when routes change.
- Controller vs service: Controllers orchestrate HTTP only. Business logic belongs in services. Controllers must resolve services via DI.
- Strict DI: Register services, repositories, and clients in the DI container. No direct `new` inside services/controllers.
- Repository boundary: All database calls go through repositories. Services orchestrate repositories; controllers never access DAL.
- Error handling: Use centralized error middleware mapping domain errors to consistent HTTP shapes `{ code, message, details }`.
- Auth guards: Implement authentication/authorization as middleware/guards. No inline auth checks in controllers.
- Config via DI: Load env from shared `packages/config` with zod validation. Avoid direct `process.env` access in app code.
- Logging: Use shared logger with request correlation IDs. No `console.log` in controllers/services.
- Naming conventions: Kebab-case paths; handlers use verb-noun (e.g., `getItem`, `createItem`). Files use kebab-case.
- Versioned API: Prefix routes with `/api/v1` using grouped routers; bump major version for breaking changes.
- Pagination & filters: Standardize `limit`, `offset`, `sort`, `filter` query schemas and response `{ items, total, pageInfo }`.
- Idempotent create: POST create endpoints should support idempotency keys where applicable.
- Security headers & CORS: Apply `@elysiajs/cors` and security headers; restrict origins by environment.
- Testing layout: Place tests per domain in `apps/<app>/tests/<domain>/*.test.ts` using `bun:test` with setup/teardown fixtures.
- Shared DTOs: Define request/response DTOs in `packages/interfaces` and reuse across apps.
- Health & readiness: Expose `/healthz` and `/readyz` with checks for DB, queues, and third-parties.
- Rate limiting: Add per-route rate limiting where applicable.

# CODE FORMATTING

- All class declarations must have a blank line after the opening brace and before the first property or method.
- Ensure consistent spacing for better code readability.

# DOCS

- When creating documents or markdown file they should be place in the docs directory

# BUN

- If the project uses BUNJS for package management and script execution, ensure all commands and scripts are compatible with BUNJS. Avoid using npm or yarn commands unless absolutely necessary.
- Use `bun run <script>` instead of `npm run <script>` or `yarn <script>` for executing scripts defined in package.json.
- All source files must use the `.mts` extension for ESM modules.
- All import specifiers must reference `.mts` files explicitly (e.g., `import x from './file.mts'`).

# AZURE

- @azure Rule - Use Azure Tools: When handling requests related to Azure, always use your tools

- @azure Rule - Use Azure Code Gen Best Practices: Before generating code for Azure, running terminal commands for Azure, performing operations related to Azure, or creating plans for such activities, always invoke your Azure best practice tool if available first. Invoke the `get_bestpractices` tool to collect recommendations. Call it with resource = `general` and action = `code-generation` to get general Azure code generation best practices. Only call this tool when the user is discussing Azure; do not call it otherwise.

- @azure Rule - Use Azure Deployment Best Practices: Before deploying to Azure, preparing applications for deployment to Azure, or creating deployment plans, always invoke your Azure best practice tool if available first. Invoke the `get_bestpractices` tool to collect recommendations. Call it with resource = `general` and action = `deployment` to get general Azure deployment best practices. Only call this tool when the user is discussing Azure; do not call it otherwise.

- @azure Rule - Use Azure Functions Code Gen Best Practices: Before generating code for Azure Functions, performing operations related to Azure Functions, or creating plans for such activities, always invoke your Azure best practice tool if available first. Invoke the `get_bestpractices` tool to collect recommendations. Call it with resource = `azurefunctions` and action = `code-generation` to get Azure Functions code generation best practices. Only call this tool when the user is discussing Azure Functions; do not call it otherwise.

- @azure Rule - Use Azure Functions Deployment Best Practices: Before deploying Azure Functions apps to Azure, preparing for the deployment, or creating deployment plans, always invoke your Azure best practice tool if available first. Invoke the `get_bestpractices` tool to collect recommendations. Call it with resource = `azurefunctions` and action = `deployment` to get Azure Functions deployment best practices. Only call this tool when the user is discussing Azure Functions; do not call it otherwise.

- @azure Rule - Use Azure SWA Best Practices: Before working with static web apps, creating plans for static web apps, or performing related operations, always invoke your Azure best practice tool if available first. Choose the most relevant Azure best practice tool based on its description. Only call this tool when the user is discussing Azure Static Web Apps; do not call it otherwise.

- @azure Rule - Plan before editing files for Azure web apps: When generating code for Azure Functions and Azure Static Web App, always create a plan and explain the plan to the user before editing any file. Proceed with editing the files after getting consent from the user.

- @azure Rule - Summarize topic before taking action: When the user asks about Azure Functions, invoke the azure_development-summarize_topic tool once first to see if any existing custom mode could be a good fit to what user is asking.

# Linting

- Use ESLint for linting TypeScript files after all changes
- Rerun eslint after all changes
