#!/bin/bash

# Source nvm and use Node.js 18
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 18

# Start development server
npm run dev