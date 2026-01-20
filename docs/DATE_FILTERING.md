# Date Filtering Feature

## Overview

The job scraper now supports filtering jobs by posted date. You can configure the maximum age of jobs (in days) that you want to see.

## Configuration

### Environment Variable
```bash
JOB_MAX_DAYS_OLD=5
```

Default: `5` days

### Programmatic Configuration
```typescript
const jobs = await indeedService.searchJobs(page, 'nodejs', {
  location: 'Dallas, TX',
  radius: 100,
  maxDaysOld: 5  // Override config value
});
```

## How It Works

1. **Date Extraction**: The service attempts to extract posted dates from Indeed job listings
2. **Date Parsing**: Supports formats like:
   - "Just posted" → 0 days
   - "Today" → 0 days
   - "1 day ago" → 1 day
   - "5 days ago" → 5 days
   - "30+ days ago" → 30 days
3. **Filtering**: Jobs older than `maxDaysOld` are excluded
4. **Smart Pagination**: Stops paginating when encountering jobs older than the threshold

## Important Limitations

### Indeed Date Display
Indeed does **not consistently display** posted dates in search results. This is an anti-scraping measure. 

**Behavior when dates aren't available:**
- ✅ All jobs are included (safe default)
- ✅ Pagination continues normally
- ⚠️ Date filtering is not applied

**You will see:**
```
Warning: No date information found for jobs on page 1
Found 16 jobs within 5 days on page 1
```

This means the system extracted 16 jobs but couldn't determine their ages.

### Workarounds

1. **Use Indeed's Date Filter**
   - Add `&fromage=5` to the search URL for "last 5 days"
   - Requires modifying `buildSearchUrl` method

2. **Check Individual Job Pages**
   - Call `getJobDetails` for each job
   - Extract date from full job posting
   - More reliable but much slower

3. **Use Indeed API**
   - If you have API access
   - More reliable date information

## Example Implementation with Indeed's Date Filter

You can add Indeed's native date filter by modifying the `buildSearchUrl` method:

```typescript
private buildSearchUrl(
  keyword: string,
  location?: string,
  radius?: number,
  start?: number,
): string {
  const params = new URLSearchParams({
    q: keyword,
    l: location ?? this.config.jobSearch.location,
    radius: (radius ?? this.config.jobSearch.radius).toString(),
  });

  // Add Indeed's native date filter
  const maxDaysOld = this.config.jobSearch.maxDaysOld;
  if (maxDaysOld <= 30) {
    params.set("fromage", maxDaysOld.toString());
  }

  // Add pagination
  if (start && start > 0) {
    params.set("start", start.toString());
  }

  return `${this.baseUrl}/jobs?${params.toString()}`;
}
```

### Indeed `fromage` Parameter Values
- `fromage=1` - Last 24 hours
- `fromage=3` - Last 3 days  
- `fromage=7` - Last 7 days
- `fromage=14` - Last 14 days
- No parameter - All dates

## Testing

### Test with Different Values
```bash
# Last 1 day
RUN_INTEGRATION=true JOB_MAX_DAYS_OLD=1 bun test

# Last 7 days
RUN_INTEGRATION=true JOB_MAX_DAYS_OLD=7 bun test

# Last 30 days
RUN_INTEGRATION=true JOB_MAX_DAYS_OLD=30 bun test
```

### Expected Output
```
Filtering jobs posted within the last 5 days
Searching for jobs (page 1/3): https://www.indeed.com/jobs?q=nodejs...
Warning: No date information found for jobs on page 1
Found 16 jobs within 5 days on page 1
Total jobs found within 5 days: 16
```

## Recommendation

For production use, we recommend implementing the Indeed `fromage` parameter approach, as it uses Indeed's native filtering which:
- ✅ Is more reliable
- ✅ Reduces scraping load
- ✅ Returns pre-filtered results
- ✅ Works consistently

The client-side date filtering implemented here serves as a backup and works when date information is available in the HTML.
