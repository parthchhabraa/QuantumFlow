#!/bin/bash

# QuantumFlow Installation Verification Script
# This script verifies that QuantumFlow is properly installed and working

set -e

echo "QuantumFlow Installation Verification"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗${NC} $2"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# Test 1: Check if quantumflow command exists
echo "Testing command availability..."
if command -v quantumflow &> /dev/null; then
    print_result 0 "quantumflow command found"
else
    print_result 1 "quantumflow command not found"
fi

# Test 2: Check if qf alias exists
if command -v qf &> /dev/null; then
    print_result 0 "qf alias found"
else
    print_result 1 "qf alias not found"
fi

# Test 3: Version check
echo ""
echo "Testing version information..."
if VERSION=$(quantumflow --version 2>/dev/null); then
    print_result 0 "Version check successful: $VERSION"
else
    print_result 1 "Version check failed"
fi

# Test 4: Help command
echo ""
echo "Testing help command..."
if quantumflow --help &> /dev/null; then
    print_result 0 "Help command works"
else
    print_result 1 "Help command failed"
fi

# Test 5: Create test file and compress
echo ""
echo "Testing basic compression..."
TEST_FILE="test-verification-$(date +%s).txt"
TEST_DATA="QuantumFlow verification test data - $(date)"
echo "$TEST_DATA" > "$TEST_FILE"

if quantumflow "$TEST_FILE" &> /dev/null; then
    if [ -f "${TEST_FILE}.qf" ]; then
        print_result 0 "Basic compression works"
        
        # Test 6: Test decompression
        echo ""
        echo "Testing decompression..."
        rm "$TEST_FILE"  # Remove original
        
        if quantumflow -d "${TEST_FILE}.qf" &> /dev/null; then
            if [ -f "$TEST_FILE" ]; then
                # Verify content
                if [ "$(cat "$TEST_FILE")" = "$TEST_DATA" ]; then
                    print_result 0 "Decompression works correctly"
                else
                    print_result 1 "Decompression corrupted data"
                fi
            else
                print_result 1 "Decompressed file not created"
            fi
        else
            print_result 1 "Decompression failed"
        fi
    else
        print_result 1 "Compressed file not created"
    fi
else
    print_result 1 "Basic compression failed"
fi

# Test 7: Test integrity check
echo ""
echo "Testing integrity verification..."
if [ -f "${TEST_FILE}.qf" ]; then
    if quantumflow -t "${TEST_FILE}.qf" &> /dev/null; then
        print_result 0 "Integrity verification works"
    else
        print_result 1 "Integrity verification failed"
    fi
fi

# Test 8: Test file listing
echo ""
echo "Testing file information listing..."
if [ -f "${TEST_FILE}.qf" ]; then
    if quantumflow --list "${TEST_FILE}.qf" &> /dev/null; then
        print_result 0 "File listing works"
    else
        print_result 1 "File listing failed"
    fi
fi

# Test 9: Test quantum parameters
echo ""
echo "Testing quantum parameter validation..."
if quantumflow --quantum-bit-depth 4 --max-entanglement-level 2 --help &> /dev/null; then
    print_result 0 "Quantum parameters accepted"
else
    print_result 1 "Quantum parameter validation failed"
fi

# Test 10: Test benchmark command
echo ""
echo "Testing benchmark functionality..."
if quantumflow benchmark --size 1024 --iterations 1 &> /dev/null; then
    print_result 0 "Benchmark command works"
else
    print_result 1 "Benchmark command failed"
fi

# Cleanup
echo ""
echo "Cleaning up test files..."
rm -f "$TEST_FILE" "${TEST_FILE}.qf" benchmark-test.tmp

# Summary
echo ""
echo "Verification Summary:"
echo "===================="
echo -e "Tests passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed! QuantumFlow is properly installed and working.${NC}"
    echo ""
    echo "You can now use QuantumFlow with:"
    echo "  quantumflow file.txt        # Compress a file"
    echo "  quantumflow -d file.txt.qf  # Decompress a file"
    echo "  qf file.txt                 # Use short alias"
    echo "  quantumflow --help          # Show help"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please check your installation.${NC}"
    echo ""
    echo "Common solutions:"
    echo "  1. Reinstall: npm uninstall -g quantumflow && npm install -g quantumflow"
    echo "  2. Check PATH: echo \$PATH | grep npm"
    echo "  3. Fix permissions: sudo chown -R \$(whoami) \$(npm config get prefix)/{lib/node_modules,bin,share}"
    echo ""
    exit 1
fi