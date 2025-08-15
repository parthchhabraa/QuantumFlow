@echo off
REM QuantumFlow Installation Script for Windows
REM This script installs QuantumFlow globally on Windows systems

echo QuantumFlow Installation Script
echo ===============================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed. Please install Node.js 16+ first.
    echo Visit: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo Node.js version: 
node --version
echo npm version: 
npm --version
echo.

REM Install QuantumFlow globally
echo Installing QuantumFlow globally...
npm install -g quantumflow

REM Verify installation
quantumflow --version >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo ✓ QuantumFlow installed successfully!
    echo.
    echo Usage:
    echo   quantumflow --help          # Show help
    echo   quantumflow file.txt        # Compress file.txt
    echo   quantumflow -d file.txt.qf  # Decompress file.txt.qf
    echo.
    echo You can also use the short alias 'qf':
    echo   qf file.txt                 # Same as quantumflow file.txt
    echo.
    quantumflow --version
    echo.
    echo Running installation verification...
    
    REM Check if verification script exists locally and run it
    if exist "%~dp0verify-installation.bat" (
        call "%~dp0verify-installation.bat"
    ) else (
        echo Verification script not found. You can manually verify by running:
        echo   quantumflow --version
        echo   echo test ^> test.txt ^&^& quantumflow test.txt ^&^& quantumflow -d test.txt.qf
    )
) else (
    echo Error: Installation failed. QuantumFlow command not found.
    echo.
    echo Troubleshooting:
    echo 1. Make sure Node.js and npm are properly installed
    echo 2. Try running as Administrator
    echo 3. Check if npm global directory is in your PATH
    echo 4. Reinstall with: npm uninstall -g quantumflow ^&^& npm install -g quantumflow
    pause
    exit /b 1
)

pause