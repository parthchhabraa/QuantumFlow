#!/bin/bash

# QuantumFlow Package Test Script
# Tests the built package to ensure it works correctly

set -e

echo "QuantumFlow Package Test"
echo "======================="

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "Error: dist directory not found. Run 'npm run build' first."
    exit 1
fi

# Test 1: CLI help command
echo "Testing CLI help command..."
if node dist/cli/index.js --help > /dev/null 2>&1; then
    echo "✓ CLI help command works"
else
    echo "✗ CLI help command failed"
    exit 1
fi

# Test 2: Version command
echo "Testing version command..."
VERSION_OUTPUT=$(node dist/cli/index.js version 2>/dev/null | head -1)
if [[ "$VERSION_OUTPUT" == *"QuantumFlow v"* ]]; then
    echo "✓ Version command works: $VERSION_OUTPUT"
else
    echo "✗ Version command failed"
    exit 1
fi

# Test 3: Create test file and compress
echo "Testing basic compression..."
# Create a larger test file for better compression
for i in {1..50}; do
    echo "Hello, QuantumFlow! This is line $i of a test file for compression testing. It contains repeated patterns that should compress well with quantum algorithms."
done > test-package.txt

if node dist/cli/index.js test-package.txt 2>/dev/null; then
    echo "✓ Basic compression works"
    
    # Check if compressed file was created
    if [ -f "test-package.txt.qf" ]; then
        echo "✓ Compressed file created"
        
        # Test decompression
        if [ -f "test-package.txt" ]; then
            rm test-package.txt  # Remove original if it exists
        fi
        if node dist/cli/index.js -d test-package.txt.qf > /dev/null 2>&1; then
            echo "✓ Decompression works"
            
            # Verify content
            if [ -f "test-package.txt" ]; then
                CONTENT=$(cat test-package.txt | head -1)
                if [[ "$CONTENT" == *"Hello, QuantumFlow!"* ]]; then
                    echo "✓ Content verification passed"
                else
                    echo "✗ Content verification failed"
                    exit 1
                fi
            else
                echo "✗ Decompressed file not found"
                exit 1
            fi
        else
            echo "✗ Decompression failed"
            exit 1
        fi
    else
        echo "✗ Compressed file not created"
        exit 1
    fi
else
    echo "✗ Basic compression failed"
    exit 1
fi

# Test 4: Test integrity check
echo "Testing integrity check..."
if node dist/cli/index.js -t test-package.txt.qf > /dev/null 2>&1; then
    echo "✓ Integrity check works"
else
    echo "✗ Integrity check failed"
    exit 1
fi

# Test 5: List command
echo "Testing list command..."
if node dist/cli/index.js --list test-package.txt.qf > /dev/null 2>&1; then
    echo "✓ List command works"
else
    echo "✗ List command failed"
    exit 1
fi

# Test 6: Package creation
echo "Testing package creation..."
if npm pack > /dev/null 2>&1; then
    PACKAGE_FILE=$(ls quantumflow-*.tgz | head -1)
    if [ -f "$PACKAGE_FILE" ]; then
        echo "✓ Package created: $PACKAGE_FILE"
        PACKAGE_SIZE=$(stat -f%z "$PACKAGE_FILE" 2>/dev/null || stat -c%s "$PACKAGE_FILE" 2>/dev/null)
        echo "  Package size: $PACKAGE_SIZE bytes"
    else
        echo "✗ Package file not found"
        exit 1
    fi
else
    echo "✗ Package creation failed"
    exit 1
fi

# Cleanup
rm -f test-package.txt test-package.txt.qf

echo ""
echo "✓ All package tests passed!"
echo ""
echo "Package is ready for distribution:"
echo "  - CLI commands work correctly"
echo "  - Compression/decompression functional"
echo "  - Package builds successfully"
echo ""
echo "To install globally:"
echo "  npm install -g ./$PACKAGE_FILE"