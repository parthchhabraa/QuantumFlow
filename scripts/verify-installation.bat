@echo off
REM QuantumFlow Installation Verification Script for Windows
REM This script verifies that QuantumFlow is properly installed and working

setlocal enabledelayedexpansion

echo QuantumFlow Installation Verification
echo ====================================
echo.

set TESTS_PASSED=0
set TESTS_FAILED=0

REM Function to print test results (simulated with goto)
goto :start_tests

:print_success
echo ✓ %~1
set /a TESTS_PASSED+=1
goto :eof

:print_failure
echo ✗ %~1
set /a TESTS_FAILED+=1
goto :eof

:start_tests

REM Test 1: Check if quantumflow command exists
echo Testing command availability...
quantumflow --version >nul 2>&1
if %errorlevel% equ 0 (
    call :print_success "quantumflow command found"
) else (
    call :print_failure "quantumflow command not found"
)

REM Test 2: Check if qf alias exists
qf --version >nul 2>&1
if %errorlevel% equ 0 (
    call :print_success "qf alias found"
) else (
    call :print_failure "qf alias not found"
)

REM Test 3: Version check
echo.
echo Testing version information...
for /f "tokens=*" %%i in ('quantumflow --version 2^>nul') do set VERSION=%%i
if defined VERSION (
    call :print_success "Version check successful: !VERSION!"
) else (
    call :print_failure "Version check failed"
)

REM Test 4: Help command
echo.
echo Testing help command...
quantumflow --help >nul 2>&1
if %errorlevel% equ 0 (
    call :print_success "Help command works"
) else (
    call :print_failure "Help command failed"
)

REM Test 5: Create test file and compress
echo.
echo Testing basic compression...
set TEST_FILE=test-verification-%RANDOM%.txt
set TEST_DATA=QuantumFlow verification test data - %DATE% %TIME%
echo !TEST_DATA! > !TEST_FILE!

quantumflow !TEST_FILE! >nul 2>&1
if %errorlevel% equ 0 (
    if exist "!TEST_FILE!.qf" (
        call :print_success "Basic compression works"
        
        REM Test 6: Test decompression
        echo.
        echo Testing decompression...
        del !TEST_FILE!
        
        quantumflow -d "!TEST_FILE!.qf" >nul 2>&1
        if %errorlevel% equ 0 (
            if exist !TEST_FILE! (
                call :print_success "Decompression works correctly"
            ) else (
                call :print_failure "Decompressed file not created"
            )
        ) else (
            call :print_failure "Decompression failed"
        )
    ) else (
        call :print_failure "Compressed file not created"
    )
) else (
    call :print_failure "Basic compression failed"
)

REM Test 7: Test integrity check
echo.
echo Testing integrity verification...
if exist "!TEST_FILE!.qf" (
    quantumflow -t "!TEST_FILE!.qf" >nul 2>&1
    if %errorlevel% equ 0 (
        call :print_success "Integrity verification works"
    ) else (
        call :print_failure "Integrity verification failed"
    )
)

REM Test 8: Test file listing
echo.
echo Testing file information listing...
if exist "!TEST_FILE!.qf" (
    quantumflow --list "!TEST_FILE!.qf" >nul 2>&1
    if %errorlevel% equ 0 (
        call :print_success "File listing works"
    ) else (
        call :print_failure "File listing failed"
    )
)

REM Test 9: Test quantum parameters
echo.
echo Testing quantum parameter validation...
quantumflow --quantum-bit-depth 4 --max-entanglement-level 2 --help >nul 2>&1
if %errorlevel% equ 0 (
    call :print_success "Quantum parameters accepted"
) else (
    call :print_failure "Quantum parameter validation failed"
)

REM Test 10: Test benchmark command
echo.
echo Testing benchmark functionality...
quantumflow benchmark --size 1024 --iterations 1 >nul 2>&1
if %errorlevel% equ 0 (
    call :print_success "Benchmark command works"
) else (
    call :print_failure "Benchmark command failed"
)

REM Cleanup
echo.
echo Cleaning up test files...
if exist !TEST_FILE! del !TEST_FILE!
if exist "!TEST_FILE!.qf" del "!TEST_FILE!.qf"
if exist benchmark-test.tmp del benchmark-test.tmp

REM Summary
echo.
echo Verification Summary:
echo ====================
echo Tests passed: !TESTS_PASSED!
echo Tests failed: !TESTS_FAILED!
echo.

if !TESTS_FAILED! equ 0 (
    echo ✓ All tests passed! QuantumFlow is properly installed and working.
    echo.
    echo You can now use QuantumFlow with:
    echo   quantumflow file.txt        # Compress a file
    echo   quantumflow -d file.txt.qf  # Decompress a file
    echo   qf file.txt                 # Use short alias
    echo   quantumflow --help          # Show help
    exit /b 0
) else (
    echo ✗ Some tests failed. Please check your installation.
    echo.
    echo Common solutions:
    echo   1. Reinstall: npm uninstall -g quantumflow ^&^& npm install -g quantumflow
    echo   2. Check PATH includes npm global directory
    echo   3. Run as Administrator if permission issues occur
    echo.
    exit /b 1
)