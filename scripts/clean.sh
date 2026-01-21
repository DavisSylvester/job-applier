#!/bin/bash

echo "🧹 Cleaning monorepo..."

# Clean root
rm -rf node_modules dist

# Clean apps
rm -rf apps/*/node_modules apps/*/dist

# Clean packages
rm -rf packages/*/node_modules packages/*/dist

# Clean ui
rm -rf ui/*/node_modules ui/*/dist

echo "✅ Clean complete!"
