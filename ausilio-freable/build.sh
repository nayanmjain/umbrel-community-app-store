#!/bin/bash
set -e

echo "Building AirtableSync Docker images..."

echo "1. Building nginx proxy..."
docker build -t airtablesync/nginx:1.0.0 -f nginx/Dockerfile .

echo "2. Building AI Engine..."
docker build -t airtablesync/ai-engine:1.0.0 -f ai-engine/Dockerfile .

echo "3. Pulling NocoDB base image..."
docker pull nocodb/nocodb:2026.06.0

echo "4. Pulling PostgreSQL..."
docker pull postgres:17-alpine

echo ""
echo "Build complete. Run 'docker compose up -d' to start."
