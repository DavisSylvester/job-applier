# MongoDB Quick Start Guide

## Environment Setup

Add these variables to your `.env` file:

```env
# MongoDB Configuration
MONGO_USERNAME=your-mongodb-username
MONGO_PASSWORD=your-mongodb-password
MONGO_HOST=mongodb.net
MONGO_CLUSTER=cluster0
MONGO_DB_NAME=job-applier
```

## MongoDB Atlas Setup (5 minutes)

### 1. Create Account
- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Sign up for free account

### 2. Create Cluster
- Click "Build a Database"
- Choose "FREE" tier (M0)
- Select cloud provider and region
- Name your cluster (e.g., "cluster0")
- Click "Create"

### 3. Create Database User
- In left menu, click "Database Access"
- Click "Add New Database User"
- Select "Password" authentication
- Enter username and password (save these!)
- Set privileges: "Read and write to any database"
- Click "Add User"

### 4. Whitelist IP Address
- In left menu, click "Network Access"
- Click "Add IP Address"
- For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
- For production: Add your specific IP
- Click "Confirm"

### 5. Get Connection Details
- Go back to "Database" in left menu
- Click "Connect" on your cluster
- Choose "Connect your application"
- Copy the connection string
- Extract values:
  - `MONGO_HOST`: The domain after `@` and before first `.` (e.g., "mongodb.net")
  - `MONGO_CLUSTER`: The subdomain (e.g., "cluster0")

Example connection string:
```
mongodb+srv://myuser:<password>@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```

From this, extract:
- `MONGO_USERNAME`: myuser
- `MONGO_PASSWORD`: (your password)
- `MONGO_CLUSTER`: cluster0
- `MONGO_HOST`: abc123.mongodb.net
- `MONGO_DB_NAME`: job-applier (you choose this)

## Test Connection

Create a test file `test-mongo.mts`:

```typescript
import "dotenv/config";
import { loadConfig } from "./src/config/index.mts";
import { DatabaseService } from "./src/services/database.service.mts";

async function test() {
  const config = loadConfig();
  const db = new DatabaseService(config);
  
  try {
    await db.connect();
    console.log("✓ Connected successfully!");
    console.log("Status:", db.getConnectionStatus());
    await db.disconnect();
  } catch (error) {
    console.error("✗ Connection failed:", error);
  }
}

test();
```

Run test:
```bash
bun run test-mongo.mts
```

## Verify Data

### Using MongoDB Atlas UI
1. Go to "Database" in left menu
2. Click "Browse Collections"
3. Select your database (e.g., "job-applier")
4. View "jobs" collection

### Using MongoDB Shell
```bash
# Install MongoDB shell
brew install mongodb/brew/mongodb-community-shell

# Connect
mongosh "mongodb+srv://cluster0.abc123.mongodb.net/job-applier" --username YOUR_USERNAME

# View collections
show collections

# Count jobs
db.jobs.countDocuments()

# Find all jobs
db.jobs.find()

# Find unapplied jobs
db.jobs.find({ applied: false })

# Get statistics
db.jobs.aggregate([
  {
    $group: {
      _id: "$applied",
      count: { $sum: 1 }
    }
  }
])
```

## Common Issues

### Connection Timeout
**Error**: `MongoServerSelectionError: connection timed out`

**Solutions**:
1. Check IP whitelist in MongoDB Atlas
2. Verify credentials are correct
3. Check firewall/proxy settings
4. Try "Allow Access from Anywhere" for testing

### Authentication Failed
**Error**: `MongoServerError: Authentication failed`

**Solutions**:
1. Double-check MONGO_USERNAME
2. Double-check MONGO_PASSWORD
3. Verify user has correct permissions
4. Check if special characters in password are URL-encoded

### Database Not Found
**Error**: Database doesn't appear in Atlas

**Solution**: MongoDB creates databases on first write. Run the application once to create it.

### Duplicate Key Error
**Error**: `E11000 duplicate key error collection: jobs index: url`

**Solution**: This is expected behavior. The repository automatically updates existing jobs instead of creating duplicates.

## Usage Examples

### Run Application
```bash
bun start
```

Output should show:
```
✓ Configuration loaded
✓ Connected to MongoDB successfully
✓ Browser launched
...
✓ Found 10 jobs
✓ Saved 8 jobs to database

📊 Database Statistics:
   Total jobs stored: 45
   Applied: 12
   Not applied: 33

✓ Database disconnected
```

### Query Jobs Programmatically

```typescript
import { JobRepository } from "./src/repositories/job.repository.mts";

const repo = new JobRepository();

// Find all unapplied jobs
const jobs = await repo.findAll({
  applied: false,
  limit: 10
});

// Find jobs by company
const techCorpJobs = await repo.findAll({
  company: "Tech Corp"
});

// Get statistics
const stats = await repo.getStats();
console.log(stats);
```

## Maintenance

### Backup Database
In MongoDB Atlas:
1. Go to "Backup" in left menu
2. Enable "Cloud Backup"
3. Configure backup schedule

### Monitor Performance
In MongoDB Atlas:
1. Go to "Metrics" tab
2. Monitor:
   - Connections
   - Operations per second
   - Network usage
   - Storage size

### View Logs
In MongoDB Atlas:
1. Go to "Logs" in left menu
2. Select log type:
   - mongodb.log (server logs)
   - mongos.log (query router logs)

## Best Practices

1. **Credentials**: Never commit .env file
2. **IP Whitelist**: Use specific IPs in production
3. **Indexes**: Monitor index usage in Atlas metrics
4. **Connection Pooling**: Let Mongoose handle it automatically
5. **Error Handling**: Application logs errors but continues running
6. **Backups**: Enable automated backups in production
7. **Monitoring**: Set up alerts in MongoDB Atlas

## Next Steps

After successful setup:

1. ✅ Run the application and verify jobs are saved
2. ✅ Check MongoDB Atlas to see your data
3. ✅ Monitor the application logs for save confirmations
4. ✅ Query the database to verify data structure
5. ✅ Set up automated backups
6. ✅ Configure monitoring alerts

## Support

- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com/
- Mongoose Documentation: https://mongoosejs.com/docs/
- Project Documentation: See `docs/MONGODB_INTEGRATION.md`

## Summary Checklist

- [ ] MongoDB Atlas account created
- [ ] Cluster created and running
- [ ] Database user created with credentials
- [ ] IP address whitelisted
- [ ] Connection details extracted
- [ ] Environment variables configured in .env
- [ ] Test connection successful
- [ ] Application runs and saves jobs
- [ ] Data visible in MongoDB Atlas
- [ ] Backups configured (production)
