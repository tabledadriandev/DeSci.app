#!/bin/bash

# Production Database Migration Script
# Usage: ./scripts/migrate-production.sh

set -e

echo "Starting production database migration..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not set"
  exit 1
fi

# Backup database
echo "Creating database backup..."
BACKUP_FILE="backup-$(date +%Y%m%d-%H%M%S).sql"
pg_dump "$DATABASE_URL" > "$BACKUP_FILE"
echo "Backup created: $BACKUP_FILE"

# Run migration
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Verify data integrity
echo "Verifying data integrity..."
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"User\";" || echo "Warning: Could not verify user count"

# Check for errors
if [ $? -eq 0 ]; then
  echo "Migration completed successfully"
else
  echo "Migration failed. Restore from backup: $BACKUP_FILE"
  exit 1
fi

echo "Migration script completed"
