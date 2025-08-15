# QuantumFlow Usage Guide

Complete guide for using QuantumFlow quantum-inspired compression algorithm.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Basic Commands](#basic-commands)
3. [Advanced Usage](#advanced-usage)
4. [Quantum Parameters](#quantum-parameters)
5. [Batch Processing](#batch-processing)
6. [Configuration](#configuration)
7. [Performance Optimization](#performance-optimization)
8. [Troubleshooting](#troubleshooting)

## Quick Start

### Installation Verification
After installing QuantumFlow, verify it's working:

```bash
# Check version
quantumflow --version

# Run verification script
scripts/verify-installation.sh  # Unix/Linux/macOS
scripts\verify-installation.bat  # Windows

# Quick test
echo "Hello QuantumFlow" > test.txt
quantumflow test.txt
quantumflow -d test.txt.qf
cat test.txt
rm test.txt test.txt.qf
```

### First Compression
```bash
# Compress a file
quantumflow document.pdf
# Creates document.pdf.qf

# Decompress the file
quantumflow -d document.pdf.qf
# Restores document.pdf
```

## Basic Commands

### Compression
```bash
# Basic compression
quantumflow file.txt

# Compress with verbose output
quantumflow -v file.txt

# Compress and keep original
quantumflow -k file.txt

# Compress with custom output name
quantumflow -o compressed.qf file.txt

# Force overwrite existing files
quantumflow -f file.txt
```

### Decompression
```bash
# Basic decompression
quantumflow -d file.txt.qf

# Decompress with verbose output
quantumflow -d -v file.txt.qf

# Decompress and keep compressed file
quantumflow -d -k file.txt.qf

# Decompress with custom output name
quantumflow -d -o restored.txt file.txt.qf
```

### File Operations
```bash
# Test file integrity
quantumflow -t file.txt.qf

# List file information
quantumflow --list file.txt.qf

# Test multiple files
quantumflow -t *.qf

# List multiple files
quantumflow --list *.qf
```

## Advanced Usage

### Recursive Directory Processing
```bash
# Compress entire directory
quantumflow -r documents/

# Compress directory with progress
quantumflow -r --progress --verbose logs/

# Compress directory keeping originals
quantumflow -r -k backup/
```

### Using Short Alias
```bash
# All commands work with 'qf' alias
qf file.txt                    # Same as quantumflow file.txt
qf -d file.txt.qf             # Same as quantumflow -d file.txt.qf
qf -v -k *.txt                # Same as quantumflow -v -k *.txt
```

### Compression Levels
```bash
# Fast compression (level 1-3)
quantumflow -l 1 file.txt

# Balanced compression (level 4-6, default: 6)
quantumflow -l 6 file.txt

# Maximum compression (level 7-9)
quantumflow -l 9 file.txt
```

## Quantum Parameters

### Understanding Quantum Parameters

QuantumFlow uses four main quantum simulation parameters:

1. **Quantum Bit Depth** (`--quantum-bit-depth`): Controls quantum state complexity
2. **Max Entanglement Level** (`--max-entanglement-level`): Maximum correlation depth
3. **Superposition Complexity** (`--superposition-complexity`): Parallel processing complexity
4. **Interference Threshold** (`--interference-threshold`): Optimization threshold

### Parameter Tuning Examples

#### For Text Files
```bash
# Good balance for text documents
quantumflow --quantum-bit-depth 10 --max-entanglement-level 5 document.txt

# Maximum compression for large text files
quantumflow --quantum-bit-depth 14 --max-entanglement-level 7 --superposition-complexity 8 large-text.txt
```

#### For Binary Files
```bash
# Balanced settings for executables
quantumflow --quantum-bit-depth 8 --superposition-complexity 6 program.exe

# Fast processing for random binary data
quantumflow --quantum-bit-depth 4 --max-entanglement-level 2 random-data.bin
```

#### For Already Compressed Files
```bash
# Light processing for ZIP/RAR files
quantumflow --quantum-bit-depth 4 --max-entanglement-level 2 --interference-threshold 0.7 archive.zip
```

#### For Large Files (>100MB)
```bash
# Memory-efficient settings
quantumflow --quantum-bit-depth 6 --max-entanglement-level 3 large-file.bin

# With progress indicator
quantumflow --quantum-bit-depth 6 --progress --verbose huge-dataset.csv
```

### Parameter Ranges and Defaults

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| `--quantum-bit-depth` | 2-16 | 8 | Higher = better compression, more memory |
| `--max-entanglement-level` | 1-8 | 4 | Higher = better for structured data |
| `--superposition-complexity` | 1-10 | 5 | Higher = better pattern recognition |
| `--interference-threshold` | 0.1-0.9 | 0.5 | Lower = more aggressive optimization |

## Batch Processing

### Multiple Files
```bash
# Compress all text files
quantumflow *.txt

# Compress with batch mode and progress
quantumflow --batch --progress *.log

# Compress specific files
quantumflow file1.txt file2.pdf file3.csv
```

### Progress Indicators
```bash
# Show progress bar
quantumflow --progress *.txt

# Verbose batch processing
quantumflow --batch --verbose --progress documents/*.pdf

# Combine with quantum parameters
quantumflow --batch --progress --quantum-bit-depth 10 *.txt
```

### Error Handling in Batch Mode
```bash
# Continue processing even if some files fail
quantumflow --batch *.* 

# Check exit code for batch results
quantumflow --batch *.txt
echo "Exit code: $?"  # 0=success, 1=all failed, 2=partial success
```

## Configuration

### Configuration Files

QuantumFlow looks for configuration files in this order:
1. File specified with `--config` option
2. `quantumflow.config.json` in current directory
3. `~/.quantumflow/config.json` in user home directory

### Creating Configuration Files

#### Basic Configuration
```json
{
  "quantumBitDepth": 10,
  "maxEntanglementLevel": 5,
  "superpositionComplexity": 7,
  "interferenceThreshold": 0.6,
  "verbose": true,
  "keepOriginal": false,
  "forceOverwrite": false
}
```

#### Advanced Configuration
```json
{
  "quantumBitDepth": 12,
  "maxEntanglementLevel": 6,
  "superpositionComplexity": 8,
  "interferenceThreshold": 0.4,
  "verbose": true,
  "keepOriginal": true,
  "forceOverwrite": false,
  "batchMode": true,
  "showProgress": true,
  "compressionLevel": 7
}
```

### Using Configuration Files
```bash
# Use specific config file
quantumflow --config my-config.json file.txt

# Override config with command-line options
quantumflow --config config.json --quantum-bit-depth 14 file.txt

# Use default config in current directory
quantumflow file.txt  # Uses ./quantumflow.config.json if exists
```

## Performance Optimization

### Memory Usage Optimization

#### Low Memory Systems
```bash
# Minimal memory usage
quantumflow --quantum-bit-depth 4 --max-entanglement-level 2 file.txt

# Process large files with reduced parameters
quantumflow --quantum-bit-depth 6 --superposition-complexity 3 large-file.bin
```

#### High Memory Systems
```bash
# Maximum quality settings
quantumflow --quantum-bit-depth 16 --max-entanglement-level 8 --superposition-complexity 10 file.txt
```

### Speed Optimization

#### Fastest Compression
```bash
# Minimum processing time
quantumflow --quantum-bit-depth 2 --max-entanglement-level 1 --superposition-complexity 1 file.txt

# Use compression level 1
quantumflow -l 1 file.txt
```

#### Balanced Speed/Quality
```bash
# Good balance
quantumflow -l 5 file.txt

# Custom balanced settings
quantumflow --quantum-bit-depth 8 --max-entanglement-level 4 file.txt
```

### File Type Specific Optimization

#### Text Files
```bash
# Optimized for text
quantumflow --quantum-bit-depth 12 --max-entanglement-level 6 document.txt
```

#### Images
```bash
# Good for already compressed images
quantumflow --quantum-bit-depth 6 --interference-threshold 0.6 image.jpg
```

#### Videos
```bash
# Light processing for video files
quantumflow --quantum-bit-depth 4 --max-entanglement-level 2 video.mp4
```

#### Source Code
```bash
# Excellent for source code with patterns
quantumflow --quantum-bit-depth 10 --max-entanglement-level 7 --superposition-complexity 8 source.js
```

## Benchmarking

### Basic Benchmarking
```bash
# Run default benchmark
quantumflow benchmark

# Benchmark specific file
quantumflow benchmark --file dataset.bin

# Custom benchmark parameters
quantumflow benchmark --size 10485760 --iterations 10
```

### Comparing Settings
```bash
# Benchmark with different quantum settings
quantumflow --quantum-bit-depth 8 benchmark --file test.txt
quantumflow --quantum-bit-depth 12 benchmark --file test.txt
quantumflow --quantum-bit-depth 16 benchmark --file test.txt
```

### Performance Analysis
```bash
# Detailed benchmark with verbose output
quantumflow -v benchmark --iterations 5 --file large-dataset.csv

# Quick performance test
quantumflow benchmark --size 1048576 --iterations 3
```

## Troubleshooting

### Common Issues and Solutions

#### "Command not found: quantumflow"
```bash
# Check if installed
npm list -g quantumflow

# Reinstall
npm uninstall -g quantumflow
npm install -g quantumflow

# Check PATH
echo $PATH | grep npm
```

#### "Out of memory" errors
```bash
# Reduce quantum parameters
quantumflow --quantum-bit-depth 4 --max-entanglement-level 2 large-file.bin

# Process files individually
for file in *.txt; do quantumflow "$file"; done
```

#### Poor compression ratios
```bash
# Check file type
file suspicious-file.bin

# Try higher quantum parameters for structured data
quantumflow --quantum-bit-depth 12 --max-entanglement-level 6 structured-data.csv

# Use appropriate settings for file type
quantumflow --quantum-bit-depth 4 random-data.bin  # For random data
```

#### Slow processing
```bash
# Use faster settings
quantumflow --quantum-bit-depth 4 --superposition-complexity 3 file.txt

# Use compression level
quantumflow -l 3 file.txt  # Faster than default level 6
```

#### File corruption
```bash
# Test file integrity
quantumflow -t file.txt.qf

# Verify with verbose output
quantumflow -t -v file.txt.qf

# Re-compress with error correction
quantumflow --quantum-bit-depth 8 --max-entanglement-level 4 file.txt
```

### Debugging

#### Enable Verbose Output
```bash
# See detailed processing information
quantumflow -v file.txt

# Combine with other options
quantumflow -v --batch --progress *.txt
```

#### Test Installation
```bash
# Run full verification
scripts/verify-installation.sh

# Quick test
quantumflow --version
quantumflow --help
```

#### Performance Debugging
```bash
# Benchmark to identify bottlenecks
quantumflow benchmark --file problematic-file.bin

# Try different parameter combinations
quantumflow --quantum-bit-depth 6 file.txt
quantumflow --quantum-bit-depth 10 file.txt
```

## Best Practices

### File Organization
```bash
# Keep compressed files organized
mkdir compressed
quantumflow -o compressed/file.txt.qf file.txt

# Batch process with directory structure
quantumflow -r --keep documents/
```

### Backup Strategy
```bash
# Always keep originals for important files
quantumflow -k important-document.pdf

# Verify integrity after compression
quantumflow important-document.pdf
quantumflow -t important-document.pdf.qf
```

### Automation
```bash
# Create compression script
#!/bin/bash
for file in "$@"; do
    echo "Compressing: $file"
    quantumflow -v -k "$file"
    quantumflow -t "${file}.qf"
done
```

### Performance Monitoring
```bash
# Monitor compression ratios
quantumflow -v file.txt | grep "Compression ratio"

# Track processing times
time quantumflow large-file.bin
```

## Integration Examples

### With tar
```bash
# Create tar archive and compress
tar -cf archive.tar directory/
quantumflow archive.tar
```

### With find
```bash
# Find and compress old files
find . -type f -mtime +30 -exec quantumflow {} \;
```

### With cron
```bash
# Daily log compression (add to crontab)
0 2 * * * /usr/local/bin/quantumflow /var/log/*.log
```

### In Scripts
```bash
#!/bin/bash
# Backup script with QuantumFlow compression

BACKUP_DIR="/backup/$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

# Copy files
cp -r /important/data/* "$BACKUP_DIR/"

# Compress everything
quantumflow -r --progress "$BACKUP_DIR/"

# Verify integrity
quantumflow -t "$BACKUP_DIR"/*.qf

echo "Backup completed and verified"
```

---

For more information, see:
- [README.md](README.md) - General overview and installation
- [docs/CLI_MANUAL.md](docs/CLI_MANUAL.md) - Complete CLI reference
- [INSTALL.md](INSTALL.md) - Detailed installation guide

Need help? Contact support at contact@eliomatters.com or visit our [GitHub repository](https://github.com/eliomatters/quantumflow).