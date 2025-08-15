# QuantumFlow CLI Manual

Complete command-line interface reference for QuantumFlow quantum-inspired compression algorithm.

## Table of Contents

1. [Overview](#overview)
2. [Basic Usage](#basic-usage)
3. [Command Syntax](#command-syntax)
4. [Options Reference](#options-reference)
5. [Quantum Parameters](#quantum-parameters)
6. [Examples](#examples)
7. [Configuration Files](#configuration-files)
8. [Exit Codes](#exit-codes)
9. [Performance Tuning](#performance-tuning)
10. [Troubleshooting](#troubleshooting)

## Overview

QuantumFlow provides a command-line interface compatible with standard compression tools while offering advanced quantum simulation parameters for optimal compression performance.

### Key Features
- Standard compression tool compatibility (`-c`, `-d`, `-v`, `-f`, `-k`)
- Quantum parameter tuning for optimal compression
- Batch processing with progress indicators
- Integrity testing and file listing
- Performance benchmarking
- Cross-platform support

## Basic Usage

### Compression
```bash
quantumflow file.txt                    # Compress file.txt → file.txt.qf
quantumflow -v file.txt                 # Compress with verbose output
quantumflow -k file.txt                 # Compress and keep original
```

### Decompression
```bash
quantumflow -d file.txt.qf              # Decompress file.txt.qf → file.txt
quantumflow -d -v file.txt.qf           # Decompress with verbose output
```

### Testing and Information
```bash
quantumflow -t file.txt.qf              # Test file integrity
quantumflow --list file.txt.qf          # Show file information
```

## Command Syntax

```
quantumflow [options] <files...>
quantumflow <command> [options]
```

### Available Commands
- `help [command]` - Display help information
- `version` - Show version information
- `benchmark` - Run compression benchmarks

## Options Reference

### Basic Options

| Option | Long Form | Description |
|--------|-----------|-------------|
| `-c` | `--compress` | Compress files (default behavior) |
| `-d` | `--decompress` | Decompress .qf files |
| `-o <file>` | `--output <file>` | Specify output file name |
| `-v` | `--verbose` | Enable verbose output with statistics |
| `-f` | `--force` | Force overwrite existing files |
| `-k` | `--keep` | Keep input files after processing |
| `-l <n>` | `--level <n>` | Compression level (1-9, default: 6) |
| `-t` | `--test` | Test compressed file integrity |
| `-r` | `--recursive` | Process directories recursively |

### Advanced Options

| Option | Description |
|--------|-------------|
| `--list` | List compressed file contents and metadata |
| `--config <file>` | Load parameters from configuration file |
| `--batch` | Enable batch processing mode |
| `--progress` | Show progress indicators during processing |

### Quantum Parameters

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| `--quantum-bit-depth <n>` | 2-16 | 8 | Quantum state complexity |
| `--max-entanglement-level <n>` | 1-8 | 4 | Maximum entanglement depth |
| `--superposition-complexity <n>` | 1-10 | 5 | Superposition processing complexity |
| `--interference-threshold <n>` | 0.1-0.9 | 0.5 | Quantum interference threshold |

## Quantum Parameters

### Quantum Bit Depth (`--quantum-bit-depth`)
Controls the complexity of quantum state simulation.
- **Lower values (2-6)**: Faster processing, lower compression ratios
- **Higher values (10-16)**: Better compression, more memory usage
- **Recommended**: 8 for balanced performance

### Max Entanglement Level (`--max-entanglement-level`)
Determines how deeply the algorithm searches for correlated patterns.
- **Lower values (1-3)**: Faster processing, good for random data
- **Higher values (6-8)**: Better compression for structured data
- **Recommended**: 4 for general use

### Superposition Complexity (`--superposition-complexity`)
Controls parallel pattern analysis complexity.
- **Lower values (1-4)**: Faster processing, basic pattern recognition
- **Higher values (7-10)**: Advanced pattern recognition, slower processing
- **Recommended**: 5 for balanced performance

### Interference Threshold (`--interference-threshold`)
Sets the threshold for quantum interference optimization.
- **Lower values (0.1-0.3)**: More aggressive optimization, higher compression
- **Higher values (0.7-0.9)**: Conservative optimization, faster processing
- **Recommended**: 0.5 for balanced results

## Examples

### Basic Compression Examples

```bash
# Compress a single file
quantumflow document.pdf

# Compress with verbose output
quantumflow -v large-dataset.csv

# Compress and keep original
quantumflow -k important-file.txt

# Compress with custom output name
quantumflow -o compressed-data.qf data.bin
```

### Decompression Examples

```bash
# Decompress a file
quantumflow -d document.pdf.qf

# Decompress with verbose output
quantumflow -d -v large-dataset.csv.qf

# Decompress and keep compressed file
quantumflow -d -k important-file.txt.qf

# Decompress with custom output name
quantumflow -d -o restored-data.bin compressed-data.qf
```

### Batch Processing Examples

```bash
# Compress all text files
quantumflow *.txt

# Compress with batch mode and progress bar
quantumflow --batch --progress *.log

# Recursively compress directory
quantumflow -r documents/

# Compress multiple specific files
quantumflow file1.txt file2.pdf file3.csv
```

### Testing and Information Examples

```bash
# Test single file integrity
quantumflow -t backup.tar.qf

# Test multiple files
quantumflow -t *.qf

# List file information
quantumflow --list document.pdf.qf

# List multiple files
quantumflow --list *.qf
```

### Quantum Parameter Examples

```bash
# High compression for structured data
quantumflow --quantum-bit-depth 12 --max-entanglement-level 6 database.sql

# Fast compression for random data
quantumflow --quantum-bit-depth 4 --max-entanglement-level 2 random-data.bin

# Balanced settings for mixed content
quantumflow --superposition-complexity 7 --interference-threshold 0.4 mixed-content.tar

# Maximum compression (slow)
quantumflow --quantum-bit-depth 16 --max-entanglement-level 8 --superposition-complexity 10 archive.zip
```

### Benchmark Examples

```bash
# Basic benchmark
quantumflow benchmark

# Benchmark specific file
quantumflow benchmark --file large-dataset.bin

# Custom benchmark parameters
quantumflow benchmark --size 10485760 --iterations 10

# Benchmark with specific quantum settings
quantumflow --quantum-bit-depth 10 benchmark --file test-data.txt
```

## Configuration Files

### Creating Configuration Files

Create a `quantumflow.config.json` file:

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

### Using Configuration Files

```bash
# Use configuration file
quantumflow --config quantumflow.config.json file.txt

# Override config with command-line options
quantumflow --config config.json --quantum-bit-depth 12 file.txt
```

### Configuration File Locations

QuantumFlow searches for configuration files in this order:
1. File specified with `--config` option
2. `quantumflow.config.json` in current directory
3. `~/.quantumflow/config.json` in user home directory

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success - all operations completed successfully |
| 1 | Error - complete failure or invalid arguments |
| 2 | Partial success - some files failed in batch mode |

### Exit Code Examples

```bash
# Check exit code in bash
quantumflow file.txt
echo "Exit code: $?"

# Use in scripts
if quantumflow -t backup.qf; then
    echo "File is valid"
else
    echo "File is corrupted"
fi
```

## Performance Tuning

### For Different File Types

#### Text Files
```bash
# Good compression with reasonable speed
quantumflow --quantum-bit-depth 10 --max-entanglement-level 5 document.txt
```

#### Binary Files
```bash
# Balanced settings for binary data
quantumflow --quantum-bit-depth 8 --superposition-complexity 6 program.exe
```

#### Already Compressed Files
```bash
# Light processing for pre-compressed data
quantumflow --quantum-bit-depth 4 --max-entanglement-level 2 archive.zip
```

#### Large Files (>100MB)
```bash
# Memory-efficient settings
quantumflow --quantum-bit-depth 6 --batch --progress large-file.bin
```

### Memory Usage Optimization

```bash
# Low memory usage
quantumflow --quantum-bit-depth 4 --max-entanglement-level 2 file.txt

# High memory usage (better compression)
quantumflow --quantum-bit-depth 14 --max-entanglement-level 7 file.txt
```

### Speed Optimization

```bash
# Fastest compression
quantumflow --quantum-bit-depth 2 --max-entanglement-level 1 --superposition-complexity 1 file.txt

# Balanced speed/compression
quantumflow --level 3 file.txt

# Maximum compression (slowest)
quantumflow --level 9 file.txt
```

## Troubleshooting

### Common Issues and Solutions

#### "Command not found: quantumflow"
```bash
# Check installation
npm list -g quantumflow

# Reinstall if necessary
npm install -g quantumflow

# Check PATH
echo $PATH | grep npm
```

#### "Permission denied" errors
```bash
# Use sudo for global operations (Linux/macOS)
sudo quantumflow file.txt

# Or fix npm permissions
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
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
# Increase quantum parameters for structured data
quantumflow --quantum-bit-depth 12 --max-entanglement-level 6 structured-data.csv

# Check file type - some files don't compress well
file suspicious-file.bin
```

#### Slow processing
```bash
# Reduce quantum parameters
quantumflow --quantum-bit-depth 4 --superposition-complexity 3 file.txt

# Use appropriate level
quantumflow --level 3 file.txt  # Faster than default level 6
```

### Debugging Options

```bash
# Enable verbose output for debugging
quantumflow -v file.txt

# Test file integrity after compression
quantumflow file.txt && quantumflow -t file.txt.qf

# Benchmark to check performance
quantumflow benchmark --file file.txt
```

### Getting Help

```bash
# Show general help
quantumflow --help

# Show version information
quantumflow --version

# Show detailed help for specific command
quantumflow help benchmark
```

## Advanced Usage Patterns

### Scripting Examples

#### Bash Script for Batch Processing
```bash
#!/bin/bash
# compress-logs.sh - Compress all log files older than 7 days

find /var/log -name "*.log" -mtime +7 -type f | while read file; do
    echo "Compressing: $file"
    if quantumflow -v "$file"; then
        echo "Successfully compressed: $file"
    else
        echo "Failed to compress: $file"
    fi
done
```

#### PowerShell Script for Windows
```powershell
# compress-documents.ps1 - Compress all documents in a folder

Get-ChildItem -Path "C:\Documents" -Include "*.pdf","*.docx","*.xlsx" -Recurse | 
ForEach-Object {
    Write-Host "Compressing: $($_.FullName)"
    & quantumflow $_.FullName
}
```

### Integration with Other Tools

#### With tar
```bash
# Create tar archive and compress with QuantumFlow
tar -cf archive.tar directory/
quantumflow archive.tar
```

#### With find
```bash
# Find and compress files older than 30 days
find . -type f -mtime +30 -exec quantumflow {} \;
```

#### With cron
```bash
# Add to crontab for daily log compression
0 2 * * * /usr/local/bin/quantumflow /var/log/*.log
```

---

For more information, visit the [QuantumFlow GitHub repository](https://github.com/eliomatters/quantumflow) or contact support at contact@eliomatters.com.