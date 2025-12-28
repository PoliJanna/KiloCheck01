#!/bin/bash

# Source nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use Node.js 18
nvm use 18

# Test that everything is working
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Test linting
echo "Running ESLint..."
npm run lint

echo "Setup verification completed!"