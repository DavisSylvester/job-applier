# Source Field Implementation

## Overview

Added a `source` field to track the origin of job listings (e.g., "Indeed", "LinkedIn", "Glassdoor").

## Changes Made

### 1. Job Interface
**File**: [src/interfaces/job.mts](../src/interfaces/job.mts)

Added required `source` field:
```typescript
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  description: string;
  source: string;  // NEW: Identifies the job board source
  salary?: string;
  postedDate?: string;
  applied: boolean;
  appliedDate?: string;
}
```

### 2. MongoDB Schema
**File**: [src/models/job.model.mts](../src/models/job.model.mts)

Added `source` field with index:
```typescript
source: {
  type: String,
  required: true,
  index: true,
}
```

Added compound index for efficient queries:
```typescript
JobSchema.index({ source: 1, applied: 1 });
```

### 3. Indeed Service
**File**: [src/services/indeed.service.mts](../src/services/indeed.service.mts)

Jobs extracted from Indeed now include `source: "Indeed"`:
```typescript
results.push({
  id: "...",
  title: "...",
  company: "...",
  location: "...",
  url: "...",
  description: "...",
  source: "Indeed",  // Automatically set
  // ...
});
```

### 4. Job Repository
**File**: [src/repositories/job.repository.mts](../src/repositories/job.repository.mts)

Updated methods to handle `source` field:
- `save()` - Includes source in create/update
- `saveMany()` - Bulk operations include source
- `findAll()` - Can filter by source
- `count()` - Can count by source

### 5. Tests
**File**: [tests/mongodb/mongodb-integration.test.ts](../tests/mongodb/mongodb-integration.test.ts)

All test jobs now include `source: "Indeed"`.

## Usage Examples

### Query Jobs by Source

```typescript
import { JobRepository } from "./src/repositories/job.repository.mts";

const repo = new JobRepository();

// Find all Indeed jobs
const indeedJobs = await repo.findAll({ source: "Indeed" });

// Find unapplied LinkedIn jobs
const linkedInJobs = await repo.findAll({ 
  source: "LinkedIn", 
  applied: false 
});

// Count jobs by source
const indeedCount = await repo.count({ source: "Indeed" });
const linkedInCount = await repo.count({ source: "LinkedIn" });

console.log(`Indeed: ${indeedCount}, LinkedIn: ${linkedInCount}`);
```

### MongoDB Queries

```javascript
// Find jobs by source
db.jobs.find({ source: "Indeed" })

// Count by source
db.jobs.countDocuments({ source: "Indeed" })

// Group by source
db.jobs.aggregate([
  {
    $group: {
      _id: "$source",
      count: { $sum: 1 },
      applied: {
        $sum: { $cond: ["$applied", 1, 0] }
      }
    }
  }
])

// Find unapplied jobs from specific source
db.jobs.find({ source: "Indeed", applied: false })
```

## Database Schema

### Updated Jobs Collection

```json
{
  "_id": "ObjectId",
  "title": "string",
  "company": "string",
  "location": "string",
  "url": "string (unique)",
  "description": "string",
  "source": "string (indexed)",
  "salary": "string?",
  "postedDate": "string?",
  "applied": "boolean",
  "appliedDate": "string?",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Indexes

New indexes added:
- Single field: `source` (ascending)
- Compound: `{ source: 1, applied: 1 }`

Existing indexes:
- `title`, `company`, `location`, `url` (unique), `applied`
- `{ company: 1, title: 1 }`
- `{ applied: 1, createdAt: -1 }`
- `{ location: 1, applied: 1 }`

## Benefits

1. **Multi-Platform Support**: Ready to integrate additional job boards (LinkedIn, Glassdoor, etc.)
2. **Source Analytics**: Track which platforms yield the best results
3. **Filtered Queries**: Easily query jobs from specific sources
4. **Performance**: Indexed for fast source-based queries
5. **Data Integrity**: Required field ensures all jobs have a source

## Adding New Job Boards

When adding support for new job boards:

1. Create a new service (e.g., `linkedin.service.mts`)
2. Set `source: "LinkedIn"` when creating Job objects
3. Jobs will automatically be tracked by source in the database

Example:
```typescript
export class LinkedInService implements JobBoardService {
  async searchJobs(page: Page, keyword: string): Promise<Job[]> {
    // ... scraping logic ...
    
    return jobs.map(job => ({
      ...job,
      source: "LinkedIn"  // Set the source
    }));
  }
}
```

## Migration Notes

### Existing Data

Jobs in the database without a `source` field will need to be updated:

```javascript
// MongoDB shell command to update existing jobs
db.jobs.updateMany(
  { source: { $exists: false } },
  { $set: { source: "Indeed" } }
)
```

Or in TypeScript:
```typescript
import { JobModel } from "./src/models/job.model.mts";

// Update all jobs without source to "Indeed"
await JobModel.updateMany(
  { source: { $exists: false } },
  { $set: { source: "Indeed" } }
);
```

### Backward Compatibility

The `source` field is **required** for new jobs. If you have existing code that creates Job objects without `source`, it will fail TypeScript compilation and MongoDB validation.

Update all Job creation code to include `source`:
```typescript
const job: Job = {
  id: "123",
  title: "Developer",
  // ... other fields ...
  source: "Indeed"  // Must be included
};
```

## Statistics by Source

Get job statistics grouped by source:

```typescript
import { JobModel } from "./src/models/job.model.mts";

const statsBySource = await JobModel.aggregate([
  {
    $group: {
      _id: "$source",
      total: { $sum: 1 },
      applied: {
        $sum: { $cond: ["$applied", 1, 0] }
      },
      notApplied: {
        $sum: { $cond: ["$applied", 0, 1] }
      }
    }
  },
  {
    $sort: { total: -1 }
  }
]);

console.table(statsBySource);
```

Output example:
```
┌─────────┬──────────────┬───────┬─────────┬────────────┐
│ (index) │     _id      │ total │ applied │ notApplied │
├─────────┼──────────────┼───────┼─────────┼────────────┤
│    0    │  'Indeed'    │  150  │   45    │    105     │
│    1    │  'LinkedIn'  │   75  │   20    │     55     │
│    2    │ 'Glassdoor'  │   50  │   10    │     40     │
└─────────┴──────────────┴───────┴─────────┴────────────┘
```

## Testing

Verify the source field works correctly:

```bash
# Run the verification script
bun run verify-source-field.mts

# Run integration tests
bun test tests/mongodb/
```

## Summary

✅ **Interface Updated**: Job interface includes required `source` field  
✅ **Schema Updated**: MongoDB schema includes indexed `source` field  
✅ **Services Updated**: Indeed service sets `source: "Indeed"`  
✅ **Repository Updated**: All CRUD operations handle `source`  
✅ **Queries Enhanced**: Can filter and count by source  
✅ **Tests Updated**: All test jobs include source  
✅ **Documentation**: Complete usage examples and migration guide  
✅ **Verification**: Compilation and runtime verification passed  

The codebase is now ready to support multiple job board sources with proper tracking and analytics!
