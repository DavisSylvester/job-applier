# MongoDB Integration Guide

## Overview

This document describes the MongoDB integration for storing job listings found during scraping operations.

## Architecture

### Components

1. **DatabaseService** (`src/services/database.service.mts`)
   - Manages MongoDB connection lifecycle
   - Builds connection URI from configuration
   - Handles connection events and error states

2. **JobModel** (`src/models/job.model.mts`)
   - Mongoose schema definition for Job documents
   - Defines indexes for efficient queries
   - Enforces data validation

3. **JobRepository** (`src/repositories/job.repository.mts`)
   - Data access layer for job operations
   - Implements CRUD operations
   - Handles bulk operations for efficiency

4. **JobBoardsService** (updated)
   - Now accepts JobRepository via dependency injection
   - Automatically saves jobs after searches
   - Reports save statistics

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```bash
# MongoDB Configuration
MONGO_USERNAME=your-mongodb-username
MONGO_PASSWORD=your-mongodb-password
MONGO_HOST=mongodb.net
MONGO_CLUSTER=cluster0
MONGO_DB_NAME=job-applier
```

### Connection String Format

The system constructs a MongoDB Atlas connection string:

```
mongodb+srv://{username}:{password}@{cluster}.{host}.mongodb.net/{dbName}?retryWrites=true&w=majority
```

Example:
```
mongodb+srv://myuser:mypass@cluster0.mongodb.net.mongodb.net/job-applier?retryWrites=true&w=majority
```

## Database Schema

### Jobs Collection

```typescript
{
  _id: ObjectId,              // MongoDB auto-generated ID
  title: String,              // Job title (indexed)
  company: String,            // Company name (indexed)
  location: String,           // Job location (indexed)
  url: String,                // Job URL (unique, indexed)
  description: String,        // Full job description
  salary: String?,            // Optional salary information
  postedDate: String?,        // Date job was posted
  applied: Boolean,           // Application status (indexed)
  appliedDate: String?,       // Date application was submitted
  createdAt: Date,            // Document creation timestamp
  updatedAt: Date             // Document update timestamp
}
```

### Indexes

The following indexes are created for optimal query performance:

- **Single field indexes:**
  - `title` (ascending)
  - `company` (ascending)
  - `location` (ascending)
  - `url` (ascending, unique)
  - `applied` (ascending)

- **Compound indexes:**
  - `{ company: 1, title: 1 }`
  - `{ applied: 1, createdAt: -1 }`
  - `{ location: 1, applied: 1 }`

## Usage

### Initialization

The application automatically initializes the database connection on startup:

```typescript
const databaseService = new DatabaseService(config);
await databaseService.connect();

const jobRepository = new JobRepository();
```

### Automatic Job Saving

Jobs are automatically saved during search operations:

```typescript
const jobBoardsService = new JobBoardsService(jobRepository);
jobBoardsService.addBoard(indeedService);

// Jobs are automatically saved to MongoDB after search
const jobs = await jobBoardsService.search(page, keyword, options);
```

### Manual Job Operations

#### Save Single Job

```typescript
const job: Job = {
  id: "job-123",
  title: "Senior Software Engineer",
  company: "Tech Corp",
  location: "Dallas, TX",
  url: "https://indeed.com/job/123",
  description: "Job description...",
  salary: "$120k-$150k",
  postedDate: "2024-01-15",
  applied: false
};

const savedJob = await jobRepository.save(job);
```

#### Save Multiple Jobs (Bulk)

```typescript
const jobs: Job[] = [...];
const savedCount = await jobRepository.saveMany(jobs);
console.log(`Saved ${savedCount} jobs`);
```

#### Find Jobs

```typescript
// Find all unapplied jobs
const unappliedJobs = await jobRepository.findAll({
  applied: false,
  limit: 50
});

// Find jobs by company
const techCorpJobs = await jobRepository.findAll({
  company: "Tech Corp"
});

// Find jobs by location
const dallasJobs = await jobRepository.findAll({
  location: "Dallas"
});
```

#### Mark Job as Applied

```typescript
const jobId = "65abc123...";
const appliedDate = new Date().toISOString();
await jobRepository.markAsApplied(jobId, appliedDate);
```

#### Get Statistics

```typescript
const stats = await jobRepository.getStats();
console.log(`Total: ${stats.total}`);
console.log(`Applied: ${stats.applied}`);
console.log(`Not applied: ${stats.notApplied}`);
```

## Duplicate Handling

The repository implements intelligent duplicate handling:

1. **URL-based uniqueness**: The `url` field has a unique index
2. **Upsert operations**: When saving jobs, existing records are updated instead of creating duplicates
3. **Bulk operations**: Use bulk upsert for efficient batch saves

## Error Handling

All repository methods include try-catch blocks and log errors to the console. Failed database operations won't crash the application but will be reported.

```typescript
try {
  await jobRepository.save(job);
} catch (error) {
  console.error("Failed to save job:", error);
  // Application continues running
}
```

## Connection Management

### Startup

The database connection is established during application initialization:

```typescript
const databaseService = new DatabaseService(config);
await databaseService.connect();
```

### Shutdown

The connection is properly closed before application exit:

```typescript
await databaseService.disconnect();
```

### Connection Events

The service monitors connection events:
- `error`: Logs errors and updates connection status
- `disconnected`: Updates connection status

### Status Checking

```typescript
// Check if connected
const isConnected = databaseService.isConnectedToDatabase();

// Get connection state
const status = databaseService.getConnectionStatus();
// Returns: 'disconnected' | 'connected' | 'connecting' | 'disconnecting'
```

## Best Practices

### 1. Dependency Injection

Always inject JobRepository into services that need data access:

```typescript
class MyService {
  constructor(private jobRepository: JobRepository) {}
  
  async doWork() {
    const jobs = await this.jobRepository.findAll();
    // ...
  }
}
```

### 2. Bulk Operations

Use bulk operations for better performance when saving multiple jobs:

```typescript
// Good: Single bulk operation
await jobRepository.saveMany(jobs);

// Avoid: Multiple individual saves
for (const job of jobs) {
  await jobRepository.save(job); // Less efficient
}
```

### 3. Error Handling

Always handle potential database errors:

```typescript
try {
  await jobRepository.save(job);
} catch (error) {
  console.error("Database error:", error);
  // Implement fallback or retry logic
}
```

### 4. Query Optimization

Leverage indexes for efficient queries:

```typescript
// Efficient: Uses indexes
await jobRepository.findAll({ applied: false, company: "TechCorp" });

// Inefficient: Full collection scan
const allJobs = await jobRepository.findAll();
const filtered = allJobs.filter(j => j.applied === false);
```

## Troubleshooting

### Connection Failures

If you see "Failed to connect to MongoDB" errors:

1. **Check credentials**: Verify MONGO_USERNAME and MONGO_PASSWORD
2. **Network access**: Ensure your IP is whitelisted in MongoDB Atlas
3. **Connection string**: Verify MONGO_HOST and MONGO_CLUSTER are correct
4. **Database name**: Confirm MONGO_DB_NAME exists or can be created

### Duplicate Key Errors

If you see duplicate key errors:

1. Jobs with the same URL already exist
2. The upsert logic should handle this automatically
3. If errors persist, check the repository's `save()` and `saveMany()` methods

### Slow Queries

If queries are slow:

1. **Check indexes**: Run `db.jobs.getIndexes()` in MongoDB shell
2. **Add indexes**: Consider adding indexes for frequently queried fields
3. **Limit results**: Use pagination with `limit` and `skip` parameters

## Migration from File Storage

If you previously used file-based storage:

1. Export existing jobs from JSON files
2. Transform to Job interface format
3. Use `jobRepository.saveMany()` to import
4. Verify data integrity with `jobRepository.count()`

## MongoDB Atlas Setup

### 1. Create Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Note your cluster name and region

### 2. Create Database User

1. Navigate to Database Access
2. Create a new user
3. Set username and password
4. Grant "Read and write to any database" role

### 3. Configure Network Access

1. Navigate to Network Access
2. Add your IP address or use 0.0.0.0/0 (for development only)

### 4. Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Extract MONGO_HOST and MONGO_CLUSTER from the string

## Performance Considerations

### Connection Pooling

Mongoose automatically manages connection pooling. Default settings:

```typescript
{
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
}
```

### Bulk Write Performance

The `saveMany()` method uses `bulkWrite()` for optimal performance:
- Combines multiple operations into a single round trip
- Uses upsert to handle duplicates
- Returns total count of inserted and updated documents

### Index Strategy

Indexes improve read performance but can slow writes. The schema uses indexes on:
- Frequently queried fields (applied, company, location)
- Unique constraints (url)
- Compound queries (company + title, applied + createdAt)

## Security

### Credential Management

- Never commit credentials to version control
- Use environment variables for all sensitive data
- Consider using AWS Secrets Manager or similar for production

### Connection String

- Credentials are URL-encoded in the connection string
- Connection uses TLS encryption (`mongodb+srv://`)
- Write concern set to "majority" for data durability

### Access Control

- Use least-privilege principle for database users
- Create separate users for different environments
- Regularly rotate credentials

## Monitoring

### Application Logs

The system logs:
- Connection success/failure
- Number of jobs saved per search
- Database statistics on completion
- Connection state changes

### MongoDB Atlas

Monitor in MongoDB Atlas dashboard:
- Connection count
- Query performance
- Storage usage
- Index usage statistics
