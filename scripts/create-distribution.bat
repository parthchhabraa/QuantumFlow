@echo off
REM QuantumFlow Distribution Creation Script for Windows
REM This script creates a complete distribution package with all necessary files

setlocal enabledelayedexpansion

echo QuantumFlow Distribution Creation
echo ================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo Error: package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

REM Get version from package.json
for /f "tokens=*" %%i in ('node -p "require('./package.json').version"') do set VERSION=%%i
echo Creating distribution for QuantumFlow v!VERSION!
echo.

REM Clean and build
echo 1. Cleaning previous builds...
call npm run clean

echo 2. Installing dependencies...
call npm install

echo 3. Running tests...
call npm test
if %errorlevel% neq 0 (
    echo Error: Tests failed
    pause
    exit /b 1
)

echo 4. Building project...
call npm run build
if %errorlevel% neq 0 (
    echo Error: Build failed
    pause
    exit /b 1
)

REM Verify build
if not exist "dist\cli\index.js" (
    echo Error: Build failed - CLI entry point not found
    pause
    exit /b 1
)

REM Create distribution directory
set DIST_DIR=quantumflow-distribution-v!VERSION!
echo 5. Creating distribution directory: !DIST_DIR!
if exist "!DIST_DIR!" rmdir /s /q "!DIST_DIR!"
mkdir "!DIST_DIR!"

REM Copy essential files
echo 6. Copying distribution files...
xcopy /e /i /q dist "!DIST_DIR!\dist"
copy package.json "!DIST_DIR!\"
copy README.md "!DIST_DIR!\"
copy LICENSE "!DIST_DIR!\"
copy INSTALL.md "!DIST_DIR!\"

REM Copy documentation
mkdir "!DIST_DIR!\docs"
copy docs\CLI_MANUAL.md "!DIST_DIR!\docs\"

REM Copy scripts
mkdir "!DIST_DIR!\scripts"
copy scripts\install.sh "!DIST_DIR!\scripts\"
copy scripts\install.bat "!DIST_DIR!\scripts\"
copy scripts\verify-installation.sh "!DIST_DIR!\scripts\"
copy scripts\verify-installation.bat "!DIST_DIR!\scripts\"

REM Create NPM package
echo 7. Creating NPM package...
call npm pack
if %errorlevel% neq 0 (
    echo Error: Package creation failed
    pause
    exit /b 1
)

REM Move package to distribution directory
move quantumflow-*.tgz "!DIST_DIR!\"

REM Create installation instructions
echo 8. Creating installation instructions...
(
echo # QuantumFlow Quick Installation
echo.
echo ## Method 1: NPM Package ^(Recommended^)
echo ```bash
echo npm install -g ./quantumflow-*.tgz
echo ```
echo.
echo ## Method 2: Installation Script
echo.
echo ### Unix/Linux/macOS
echo ```bash
echo ./scripts/install.sh
echo ```
echo.
echo ### Windows
echo ```cmd
echo scripts\install.bat
echo ```
echo.
echo ## Verification
echo After installation, run the verification script:
echo.
echo ### Unix/Linux/macOS
echo ```bash
echo ./scripts/verify-installation.sh
echo ```
echo.
echo ### Windows
echo ```cmd
echo scripts\verify-installation.bat
echo ```
echo.
echo ## Quick Test
echo ```bash
echo echo "Hello QuantumFlow" ^> test.txt
echo quantumflow test.txt
echo quantumflow -d test.txt.qf
echo cat test.txt
echo rm test.txt test.txt.qf
echo ```
echo.
echo ## Documentation
echo - See README.md for complete usage instructions
echo - See docs/CLI_MANUAL.md for detailed CLI reference
echo - See INSTALL.md for detailed installation guide
) > "!DIST_DIR!\QUICK_INSTALL.md"

REM Create checksums (if available)
echo 9. Creating checksums...
cd "!DIST_DIR!"
if exist "C:\Windows\System32\certutil.exe" (
    for %%f in (quantumflow-*.tgz) do (
        certutil -hashfile "%%f" SHA256 > "%%f.sha256"
    )
    echo SHA256 checksums created
) else (
    echo Warning: No SHA256 utility found, skipping checksums
)
cd ..

REM Create archive (using PowerShell if available)
echo 10. Creating distribution archive...
if exist "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe" (
    powershell -Command "Compress-Archive -Path '!DIST_DIR!' -DestinationPath '!DIST_DIR!.zip' -Force"
    echo ZIP archive created: !DIST_DIR!.zip
) else (
    echo Warning: PowerShell not found, skipping ZIP creation
    echo You can manually create a ZIP archive of the !DIST_DIR! folder
)

REM Summary
echo.
echo ✓ Distribution created successfully!
echo.
echo Distribution files:
echo   - !DIST_DIR!\                    # Complete distribution directory
echo   - !DIST_DIR!.zip                 # Compressed archive ^(if PowerShell available^)
echo   - !DIST_DIR!\quantumflow-*.tgz   # NPM package
echo.
echo Installation methods:
echo   1. NPM: npm install -g ./!DIST_DIR!/quantumflow-*.tgz
echo   2. Script: !DIST_DIR!\scripts\install.bat
echo   3. Manual: Extract and follow QUICK_INSTALL.md
echo.
echo To test the distribution:
echo   cd !DIST_DIR!
echo   scripts\verify-installation.bat
echo.

REM Test the package locally
echo 11. Testing local installation...
for %%f in ("!DIST_DIR!\quantumflow-*.tgz") do (
    npm install -g "%%f" >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✓ Local installation test successful
        
        REM Quick verification
        quantumflow --version >nul 2>&1
        if !errorlevel! equ 0 (
            echo ✓ Command verification successful
        ) else (
            echo ⚠ Warning: Command verification failed
        )
        
        REM Uninstall test package
        npm uninstall -g quantumflow >nul 2>&1
    ) else (
        echo ⚠ Warning: Local installation test failed
    )
)

echo.
echo Distribution creation completed!
echo Share the !DIST_DIR!.zip file for distribution.
pause