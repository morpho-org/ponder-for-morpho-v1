#!/bin/sh
set -e

echo "Running hotfix to invalidate RPC cache for mainnet back to block 22689053..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

# Install psql if not available (Alpine Linux)
if ! command -v psql &> /dev/null; then
    echo "Installing postgresql-client..."
    apk add --no-cache postgresql-client
fi

# Execute the hotfix SQL
echo "Executing hotfix SQL..."
psql "$DATABASE_URL" -f /app/hotfix.sql

echo "Hotfix completed successfully!"