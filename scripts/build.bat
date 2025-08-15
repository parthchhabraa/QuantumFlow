@echo off
REM QuantumFlow Build Script for Windows
REM This script builds the project and prepares it for distribution

echo QuantumFlow Build Script
echo =======================

REM Check if we're in the right directory
if not exist "package.json" (
    echo Error: package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Clean previous build
echo Cleaning previous build...
npm run clean

REM Build the project
echo Building TypeScript project...
npm run build

REM Run tests to ensure build is working
echo Running tests...
npm test

REM Create package
echo Creating distribution package...
npm pack

echo.
echo ✓ Build completed successfully!
echo.
echo Distribution files:
echo   - dist\           # Compiled JavaScript
echo   - quantumflow-*.tgz  # NPM package
echo.
echo To install locally:
echo   npm install -g .\quantumflow-*.tgz
echo.
echo To test the CLI:
echo   node dist\cli\index.js --help

pause