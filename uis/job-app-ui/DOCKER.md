# Job Applier UI - Docker Deployment

## Build and Run Locally

### Build the Docker image
```bash
# From monorepo root
docker build -f uis/job-app-ui/Dockerfile -t job-applier-ui:latest .
```

### Run the container
```bash
docker run -d -p 8080:80 --name job-applier-ui job-applier-ui:latest
```

### Access the application
Open http://localhost:8080

### Stop and remove
```bash
docker stop job-applier-ui
docker rm job-applier-ui
```

## Multi-Stage Build Explanation

**Stage 1 (builder):**
- Uses Bun to install dependencies
- Resolves `workspace:*` references to local packages
- Builds Angular app with Turbo
- Output: `dist/` folder with compiled static files

**Stage 2 (runtime):**
- Lightweight nginx:alpine image
- Copies only the built static files
- No Node.js, no source code, no dependencies
- Serves Angular SPA with proper routing fallback

## Environment Variables

For runtime configuration, Angular apps use build-time environment files. To customize:

1. Create environment files in `src/environments/`
2. Use Angular's configuration system
3. Or use `environment.ts` with values injected at build time

## Production Deployment

### Azure Container Apps
```bash
az containerapp create \
  --name job-applier-ui \
  --resource-group myResourceGroup \
  --environment myEnvironment \
  --image <registry>/job-applier-ui:latest \
  --target-port 80 \
  --ingress external
```

### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: job-applier-ui
spec:
  replicas: 2
  selector:
    matchLabels:
      app: job-applier-ui
  template:
    metadata:
      labels:
        app: job-applier-ui
    spec:
      containers:
      - name: ui
        image: <registry>/job-applier-ui:latest
        ports:
        - containerPort: 80
```

## Health Check

The nginx configuration includes a `/health` endpoint:
```bash
curl http://localhost:8080/health
# Returns: healthy
```

## Notes

- Final image size: ~25MB (nginx:alpine + static files)
- No monorepo dependencies in production image
- All TypeScript types compiled away during build
- Optimized for production with gzip and caching
