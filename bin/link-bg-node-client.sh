#!/usr/bin/env zsh

BEFORE="@baragaun\/bg-node-client\": \".*\""
AFTER="@baragaun\/bg-node-client\": \"file:..\/bg-node-client\""

sed -i '' -e "s/${BEFORE}/${AFTER}/" ./package.json
npm install "file:../bg-node-client"
