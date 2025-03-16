#!/usr/bin/env bash

HOST=mmhealth

# Copying over the sources:
rsync -avPe ssh --delete \
--exclude "*.md" \
--exclude "test/*" \
--exclude "*/docs/*" \
--exclude "docker-config/nginx/ssl/*" \
--exclude "docker-compose*" \
src \
package.json \
pnpm-lock.yaml \
.dockerignore \
docker-config \
Dockerfile \
tsconfig.json \
tsconfig.prod.json \
$HOST:apps/servicepulse/

scp env/.env.production $HOST:apps/servicepulse/env/

# Building and starting the image & container:
ssh $HOST "docker compose -f /home/appuser/apps/servicepulse/docker-compose.yml up --build -d"

# Cleanup:
ssh $HOST "docker image prune -f && docker system prune -a -f"

# If you want to see the log output:
ssh $HOST "docker logs -f fsdata"

echo "Done"
