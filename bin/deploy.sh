#!/usr/bin/env bash

REMOTE_HOST=mmhealth

# Copying over the sources:
rsync -avPe ssh --delete \
--exclude "*.md" \
--exclude "test/*" \
--exclude "*/docs/*" \
src \
package.json \
tsconfig.json \
${REMOTE_HOST}:apps/servicepulse/

# To copy over the .env file (if needed):
# scp env/.env.production ${REMOTE_HOST}:apps/servicepulse/.env

# Building the app:
ssh ${REMOTE_HOST} "cd apps/servicepulse && npm install && npm run build"

# Restarting it:
ssh ${REMOTE_HOST} "pm2 restart servicepulse"

echo "Done"
