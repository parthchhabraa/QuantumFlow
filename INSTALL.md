# QuantumFlow Installation Guide

This guide provides detailed installation instructions for QuantumFlow on different platforms.

## System Requirements

### Minimum Requirements
- **Node.js**: 16.0.0 or higher
- **npm**: 8.0.0 or higher
- **RAM**: 512 MB available memory
- **Storage**: 50 MB free disk space

### Recommended Requirements
- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher
- **RAM**: 2 GB available memory (for large file processing)
- **Storage**: 100 MB free disk space

### Supported Platforms
- **macOS**: 10.15 (Catalina) or higher
- **Linux**: Ubuntu 18.04+, CentOS 7+, or equivalent
- **Windows**: Windows 10 or higher

### Supported Architectures
- x64 (Intel/AMD 64-bit)
- ARM64 (Apple Silicon, ARM64 processors)

## Installation Methods

### Method 1: Quick Install (Recommended)

#### macOS/Linux
```bash
# Download and run the installation script
curl -fsSL https://raw.githubusercontent.com/parthchhabraa/quantumflow/main/scripts/install.sh | bash
```

#### Windows
1. Download `install.bat` from the repository
2. Right-click and "Run as Administrator"
3. Follow the on-screen instructions

### Method 2: NPM Global Install

```bash
# Install globally via npm
npm install -g quantumflow

# Verify installation
quantumflow --version
```

### Method 3: From Source

```bash
# Clone the repository
git clone https://github.com/parthchhabraa/quantumflow.git
cd quantumflow

# Install dependencies
npm install

# Build the project
npm run build

# Install globally
npm install -g .

# Verify installation
quantumflow --version
```

### Method 4: Local Development Install

```bash
# Clone and setup for development
git clone https://github.com/parthchhabraa/quantumflow.git
cd quantumflow
npm install
npm run build

# Use without global install
npm run cli -- --help
```

## Platform-Specific Instructions

### macOS

#### Using Homebrew (if available)
```bash
# If you have Homebrew and Node.js installed via brew
brew install node
npm install -g quantumflow
```

#### Manual Installation
1. Install Node.js from [nodejs.org](https://nodejs.org/)
2. Open Terminal
3. Run: `npm install -g quantumflow`

### Linux

#### Ubuntu/Debian
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install QuantumFlow
npm install -g quantumflow
```

#### CentOS/RHEL/Fedora
```bash
# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs npm

# Install QuantumFlow
npm install -g quantumflow
```

#### Arch Linux
```bash
# Install Node.js
sudo pacman -S nodejs npm

# Install QuantumFlow
npm install -g quantumflow
```

### Windows

#### Using Node.js Installer
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Run the installer as Administrator
3. Open Command Prompt or PowerShell as Administrator
4. Run: `npm install -g quantumflow`

#### Using Chocolatey
```powershell
# Install Node.js via Chocolatey
choco install nodejs

# Install QuantumFlow
npm install -g quantumflow
```

#### Using Windows Subsystem for Linux (WSL)
```bash
# In WSL terminal, follow Linux instructions
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g quantumflow
```

## Verification

After installation, verify QuantumFlow is working correctly:

```bash
# Check version
quantumflow --version

# Show help
quantumflow --help

# Test with a small file
echo "Hello, QuantumFlow!" > test.txt
quantumflow test.txt
quantumflow -d test.txt.qf
cat test.txt
rm test.txt test.txt.qf
```

## Troubleshooting

### Common Installation Issues

#### "Permission denied" errors
```bash
# On macOS/Linux, use sudo for global install
sudo npm install -g quantumflow

# Or configure npm to use a different directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
npm install -g quantumflow
```

#### "Command not found: quantumflow"
```bash
# Check if npm global bin is in PATH
npm config get prefix
echo $PATH

# Add npm global bin to PATH (Linux/macOS)
echo 'export PATH=$(npm config get prefix)/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Windows: Add to PATH environment variable
# %APPDATA%\npm (typically)
```

#### Node.js version too old
```bash
# Update Node.js using Node Version Manager (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
npm install -g quantumflow
```

#### npm permission issues on macOS/Linux
```bash
# Fix npm permissions
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
```

#### Windows execution policy issues
```powershell
# Allow script execution (run as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine
```

### Installation Verification Script

Create a test script to verify your installation:

```bash
#!/bin/bash
# save as test-installation.sh

echo "Testing QuantumFlow Installation"
echo "================================"

# Test 1: Command exists
if command -v quantumflow &> /dev/null; then
    echo "✓ quantumflow command found"
else
    echo "✗ quantumflow command not found"
    exit 1
fi

# Test 2: Version check
VERSION=$(quantumflow --version 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✓ Version: $VERSION"
else
    echo "✗ Version check failed"
    exit 1
fi

# Test 3: Help command
if quantumflow --help &> /dev/null; then
    echo "✓ Help command works"
else
    echo "✗ Help command failed"
    exit 1
fi

# Test 4: Basic compression test
echo "test data" > test-file.txt
if quantumflow test-file.txt &> /dev/null; then
    echo "✓ Basic compression works"
    if [ -f "test-file.txt.qf" ]; then
        echo "✓ Compressed file created"
        if quantumflow -d test-file.txt.qf &> /dev/null; then
            echo "✓ Decompression works"
        else
            echo "✗ Decompression failed"
        fi
    else
        echo "✗ Compressed file not created"
    fi
else
    echo "✗ Basic compression failed"
fi

# Cleanup
rm -f test-file.txt test-file.txt.qf

echo "Installation test completed!"
```

## Uninstallation

To remove QuantumFlow:

```bash
# Uninstall globally
npm uninstall -g quantumflow

# Verify removal
quantumflow --version  # Should show "command not found"
```

## Getting Help

If you encounter issues during installation:

1. **Check the troubleshooting section** above
2. **Search existing issues** on [GitHub Issues](https://github.com/parthchhabraa/quantumflow/issues)
3. **Create a new issue** with:
   - Your operating system and version
   - Node.js and npm versions (`node --version`, `npm --version`)
   - Complete error messages
   - Steps you've already tried

4. **Contact support** at [hello@parthchhabra.in](mailto:hello@parthchhabra.in)

## Next Steps

After successful installation:

1. Read the [README.md](README.md) for usage instructions
2. Try the examples in the documentation
3. Run `quantumflow benchmark` to test performance
4. Explore quantum parameter tuning for your specific use cases

---

**Welcome to QuantumFlow!** 🚀
