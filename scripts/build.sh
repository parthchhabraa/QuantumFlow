#!/bin/bash

# QuantumFlow Build Script
# This script builds the project and prepares it for distribution

set -e

echo "QuantumFlow Build Script"
echo "======================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Clean previous build
echo "Cleaning previous build..."
npm run clean

# Build the project
echo "Building TypeScript project..."
npm run build

# Make CLI executable
if [ -f "dist/cli/index.js" ]; then
    chmod +x dist/cli/index.js
    echo "✓ CLI executable permissions set"
fi

# Run tests to ensure build is working
echo "Running tests..."
npm test

# Create package
echo "Creating distribution package..."
npm pack

echo ""
echo "✓ Build completed successfully!"
echo ""
echo "Distribution files:"
echo "  - dist/           # Compiled JavaScript"
echo "  - quantumflow-*.tgz  # NPM package"
echo ""
echo "To install locally:"
echo "  npm install -g ./quantumflow-*.tgz"
echo ""
echo "To test the CLI:"
echo "  node dist/cli/index.js --help"