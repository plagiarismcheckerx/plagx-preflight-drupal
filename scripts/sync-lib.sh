#!/bin/sh
# Copies the Plagx Preflight core from the sibling plagx-preflight repo into the module.
set -e
cd "$(dirname "$0")/.."
cp ../plagx-preflight/src/*.js js/lib/
echo "Synced: $(grep -o "VERSION = '[^']*'" js/lib/index.js)"
