#!/bin/bash

# QuantumFlow Distribution Creation Script
# This script creates a complete distribution package with all necessary files

set -e

echo "QuantumFlow Distribution Creation"
echo "================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
echo "Creating distribution for QuantumFlow v$VERSION"
echo ""

# Clean and build
echo "1. Cleaning previous builds..."
npm run clean

echo "2. Installing dependencies..."
npm install

echo "3. Running tests..."
npm test

echo "4. Building project..."
npm run build

# Verify build
if [ ! -f "dist/cli/index.js" ]; then
    echo "Error: Build failed - CLI entry point not found"
    exit 1
fi

echo "5. Making CLI executable..."
chmod +x dist/cli/index.js

# Create distribution directory
DIST_DIR="quantumflow-distribution-v$VERSION"
echo "6. Creating distribution directory: $DIST_DIR"
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

# Copy essential files
echo "7. Copying distribution files..."
cp -r dist/ "$DIST_DIR/"
cp package.json "$DIST_DIR/"
cp README.md "$DIST_DIR/"
cp LICENSE "$DIST_DIR/"
cp INSTALL.md "$DIST_DIR/"

# Copy documentation
mkdir -p "$DIST_DIR/docs"
cp docs/CLI_MANUAL.md "$DIST_DIR/docs/"

# Copy scripts
mkdir -p "$DIST_DIR/scripts"
cp scripts/install.sh "$DIST_DIR/scripts/"
cp scripts/install.bat "$DIST_DIR/scripts/"
cp scripts/verify-installation.sh "$DIST_DIR/scripts/"
cp scripts/verify-installation.bat "$DIST_DIR/scripts/"

# Make scripts executable
chmod +x "$DIST_DIR/scripts/"*.sh

# Create NPM package
echo "8. Creating NPM package..."
npm pack

# Move package to distribution directory
mv quantumflow-*.tgz "$DIST_DIR/"

# Create installation instructions
echo "9. Creating installation instructions..."
cat > "$DIST_DIR/QUICK_INSTALL.md" << 'EOF'
# QuantumFlow Quick Installation

## Method 1: NPM Package (Recommended)
```bash
npm install -g ./quantumflow-*.tgz
```

## Method 2: Installation Script

### Unix/Linux/macOS
```bash
./scripts/install.sh
```

### Windows
```cmd
scripts\install.bat
```

## Verification
After installation, run the verification script:

### Unix/Linux/macOS
```bash
./scripts/verify-installation.sh
```

### Windows
```cmd
scripts\verify-installation.bat
```

## Quick Test
```bash
echo "Hello QuantumFlow" > test.txt
quantumflow test.txt
quantumflow -d test.txt.qf
cat test.txt
rm test.txt test.txt.qf
```

## Documentation
- See README.md for complete usage instructions
- See docs/CLI_MANUAL.md for detailed CLI reference
- See INSTALL.md for detailed installation guide
EOF

# Create checksums
echo "10. Creating checksums..."
cd "$DIST_DIR"
if command -v sha256sum &> /dev/null; then
    sha256sum quantumflow-*.tgz > checksums.sha256
    echo "SHA256 checksums created"
elif command -v shasum &> /dev/null; then
    shasum -a 256 quantumflow-*.tgz > checksums.sha256
    echo "SHA256 checksums created"
else
    echo "Warning: No SHA256 utility found, skipping checksums"
fi
cd ..

# Create archive
echo "11. Creating distribution archive..."
tar -czf "${DIST_DIR}.tar.gz" "$DIST_DIR"
zip -r "${DIST_DIR}.zip" "$DIST_DIR" > /dev/null

# Summary
echo ""
echo "✓ Distribution created successfully!"
echo ""
echo "Distribution files:"
echo "  - ${DIST_DIR}/                    # Complete distribution directory"
echo "  - ${DIST_DIR}.tar.gz              # Compressed archive (Unix/Linux/macOS)"
echo "  - ${DIST_DIR}.zip                 # Compressed archive (Windows)"
echo "  - ${DIST_DIR}/quantumflow-*.tgz   # NPM package"
echo ""
echo "Installation methods:"
echo "  1. NPM: npm install -g ./${DIST_DIR}/quantumflow-*.tgz"
echo "  2. Script: ./${DIST_DIR}/scripts/install.sh"
echo "  3. Manual: Extract and follow QUICK_INSTALL.md"
echo ""
echo "To test the distribution:"
echo "  cd $DIST_DIR"
echo "  ./scripts/verify-installation.sh"
echo ""

# Test the package locally
echo "12. Testing local installation..."
if npm install -g "./${DIST_DIR}/quantumflow-"*.tgz; then
    echo "✓ Local installation test successful"
    
    # Quick verification
    if quantumflow --version > /dev/null 2>&1; then
        echo "✓ Command verification successful"
    else
        echo "⚠ Warning: Command verification failed"
    fi
    
    # Uninstall test package
    npm uninstall -g quantumflow > /dev/null 2>&1 || true
else
    echo "⚠ Warning: Local installation test failed"
fi

echo ""
echo "Distribution creation completed!"
echo "Share the ${DIST_DIR}.tar.gz or ${DIST_DIR}.zip file for distribution."