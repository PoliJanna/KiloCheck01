#!/bin/bash

# Source nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node.js 18 (more compatible with older macOS)
nvm install 18
nvm use 18

# Install dependencies
npm install

echo "Setup completed successfully!"