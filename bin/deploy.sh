#!/usr/bin/env bash

REMOTE_HOST=mmhealth

# Copying over the sources:
rsync -avPe ssh --delete \
--exclude "*.md" \
--exclude "test/*" \
src \
package.json \
tsconfig.json \
.dockerignore \
Dockerfile \
docker-compose.yaml \
${REMOTE_HOST}:apps/servicepulse/

# To copy over the .env file (if needed):
# scp env/.env.production ${REMOTE_HOST}:apps/servicepulse/.env

# To copy over the config file (if needed):
# scp config/*.json ${REMOTE_HOST}:apps/servicepulse/config/

# Building the app:
ssh ${REMOTE_HOST} "cd apps/servicepulse && npm install && npm run build"

# Restarting it:
ssh ${REMOTE_HOST} "pm2 restart servicepulse"

echo "Done"
