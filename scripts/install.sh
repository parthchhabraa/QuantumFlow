#!/bin/bash

# QuantumFlow Installation Script
# This script installs QuantumFlow globally on Unix-like systems

set -e

echo "QuantumFlow Installation Script"
echo "==============================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js 16+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="16.0.0"

if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION') ? 0 : 1)" 2>/dev/null; then
    echo "Error: Node.js version $NODE_VERSION is too old. Please upgrade to Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install npm first."
    exit 1
fi

echo "Node.js version: $NODE_VERSION ✓"
echo "npm version: $(npm --version) ✓"
echo ""

# Install QuantumFlow globally
echo "Installing QuantumFlow globally..."
npm install -g quantumflow

# Verify installation
if command -v quantumflow &> /dev/null; then
    echo ""
    echo "✓ QuantumFlow installed successfully!"
    echo ""
    echo "Usage:"
    echo "  quantumflow --help          # Show help"
    echo "  quantumflow file.txt        # Compress file.txt"
    echo "  quantumflow -d file.txt.qf  # Decompress file.txt.qf"
    echo ""
    echo "You can also use the short alias 'qf':"
    echo "  qf file.txt                 # Same as quantumflow file.txt"
    echo ""
    quantumflow --version
    echo ""
    echo "Running installation verification..."
    
    # Download and run verification script if available
    if command -v curl &> /dev/null; then
        curl -fsSL https://raw.githubusercontent.com/eliomatters/quantumflow/main/scripts/verify-installation.sh | bash
    else
        echo "Verification script requires curl. You can manually verify by running:"
        echo "  quantumflow --version"
        echo "  echo 'test' | quantumflow && quantumflow -d test.qf"
    fi
else
    echo "Error: Installation failed. QuantumFlow command not found."
    echo ""
    echo "Troubleshooting:"
    echo "1. Check if npm global bin is in your PATH:"
    echo "   echo \$PATH | grep npm"
    echo "2. Try adding npm global bin to PATH:"
    echo "   echo 'export PATH=\$(npm config get prefix)/bin:\$PATH' >> ~/.bashrc"
    echo "   source ~/.bashrc"
    echo "3. Reinstall with different permissions:"
    echo "   sudo npm install -g quantumflow"
    exit 1
fi