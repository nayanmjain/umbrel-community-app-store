#!/bin/bash
set -e

AI_PLUGIN_DIR="/opt/airtablesync/plugin"
NOCODB_PLUGIN_DIR="/usr/app/data/plugins"

mkdir -p "$NOCODB_PLUGIN_DIR/airtablesync-ai"

if [ -f "$AI_PLUGIN_DIR/index.html" ]; then
  cp -r "$AI_PLUGIN_DIR/"* "$NOCODB_PLUGIN_DIR/airtablesync-ai/"
  echo "AirtableSync AI plugin installed successfully"
else
  echo "Warning: AI plugin files not found at $AI_PLUGIN_DIR"
fi

exec /usr/src/appEntry/start.sh
