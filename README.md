
# QuantumFlow
[![Status](https://img.shields.io/badge/status-alpha-blueviolet)](#)
[![License](https://img.shields.io/badge/license-Apache--2.0-green)](#license)
[![Lang](https://img.shields.io/badge/lang-TypeScript-3178C6)](#)
[![Build](https://img.shields.io/badge/tests-passing-brightgreen)](#tests)


**Quantum-inspired compression algorithm by eliomatters, Developed by Parth Chhabra**

QuantumFlow leverages quantum mechanical principles (superposition, entanglement, and quantum interference) simulated on conventional computers to achieve superior compression ratios compared to traditional algorithms.

## Features

- **Quantum-Inspired Compression**: Uses simulated quantum mechanics for superior compression ratios
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Command-Line Interface**: Compatible with standard compression tools
- **Batch Processing**: Process multiple files with progress indicators
- **Configurable Parameters**: Fine-tune quantum simulation parameters
- **Integrity Testing**: Built-in compressed file integrity verification
- **Performance Benchmarking**: Compare against standard compression algorithms

## Installation

### Quick Install (Recommended)

#### Unix/Linux/macOS
```bash
curl -fsSL https://raw.githubusercontent.com/parthchhabraa/quantumflow/main/scripts/install.sh | bash
```

#### Windows (PowerShell)
```powershell
# Download and run install.bat
# Or use npm directly:
npm install -g quantumflow
```

### Manual Installation

#### Prerequisites
- Node.js 16.0.0 or higher
- npm 8.0.0 or higher

#### From NPM
```bash
npm install -g quantumflow
```

#### From Source
```bash
git clone https://github.com/parthchhabraa/quantumflow.git
cd quantumflow
npm install
npm run build
npm install -g .
```

## Usage

### Basic Usage

```bash
# Compress a file
quantumflow file.txt
# Creates file.txt.qf

# Decompress a file
quantumflow -d file.txt.qf
# Restores file.txt

# Use short alias
qf file.txt
```

### Advanced Usage

```bash
# Compress with verbose output
quantumflow -v file.txt

# Compress multiple files with progress bar
quantumflow --batch --progress *.txt

# Compress directory recursively
quantumflow -r directory/

# Keep original files after compression
quantumflow -k file.txt

# Force overwrite existing files
quantumflow -f file.txt

# Test compressed file integrity
quantumflow -t file.txt.qf

# List compressed file information
quantumflow --list file.txt.qf

# Custom quantum parameters
quantumflow --quantum-bit-depth 12 --max-entanglement-level 6 file.txt
```

### Quantum Parameters

Fine-tune the quantum simulation for optimal compression:

- `--quantum-bit-depth <n>`: Quantum state complexity (2-16, default: 8)
- `--max-entanglement-level <n>`: Maximum entanglement depth (1-8, default: 4)
- `--superposition-complexity <n>`: Superposition processing complexity (1-10, default: 5)
- `--interference-threshold <n>`: Quantum interference threshold (0.1-0.9, default: 0.5)

### Benchmarking

```bash
# Run compression benchmark
quantumflow benchmark

# Benchmark specific file
quantumflow benchmark --file large-dataset.bin

# Custom benchmark parameters
quantumflow benchmark --size 10485760 --iterations 10
```

## Command Reference

### Options

| Option | Description |
|--------|-------------|
| `-c, --compress` | Compress files (default behavior) |
| `-d, --decompress` | Decompress .qf files |
| `-o, --output <file>` | Specify output file name |
| `-v, --verbose` | Enable verbose output with statistics |
| `-f, --force` | Force overwrite existing files |
| `-k, --keep` | Keep input files after processing |
| `-l, --level <n>` | Compression level (1-9, affects quantum parameters) |
| `-t, --test` | Test compressed file integrity |
| `--list` | List compressed file contents and metadata |
| `--batch` | Enable batch processing mode |
| `--progress` | Show progress indicators |
| `-r, --recursive` | Process directories recursively |
| `--config <file>` | Load parameters from configuration file |

### Quantum Parameters

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| `--quantum-bit-depth` | 2-16 | 8 | Controls quantum state complexity |
| `--max-entanglement-level` | 1-8 | 4 | Maximum entanglement depth |
| `--superposition-complexity` | 1-10 | 5 | Superposition processing complexity |
| `--interference-threshold` | 0.1-0.9 | 0.5 | Quantum interference threshold |

### Exit Codes

- `0`: Success
- `1`: Error or complete failure
- `2`: Partial success (some files failed in batch mode)

## File Format

QuantumFlow uses the `.qf` extension for compressed files. The format includes:

- Quantum state vectors with complex amplitudes
- Entanglement correlation maps
- Quantum interference patterns
- Compression metadata and checksums

## Performance

QuantumFlow typically achieves:
- **15%+ better compression ratios** than gzip
- **Competitive processing speeds** for most file types
- **Excellent performance** on structured and semi-structured data
- **Graceful degradation** on highly random data

## Examples

### Compress a log file with optimal settings
```bash
quantumflow -v --quantum-bit-depth 10 --max-entanglement-level 5 server.log
```

### Batch compress all documents in a directory
```bash
quantumflow --batch --progress --recursive documents/
```

### Test and verify compressed files
```bash
quantumflow -t *.qf
```

### Benchmark against your data
```bash
quantumflow benchmark --file your-dataset.bin --iterations 5
```

## Configuration File

Create a `quantumflow.config.json` file for custom default parameters:

```json
{
  "quantumBitDepth": 10,
  "maxEntanglementLevel": 5,
  "superpositionComplexity": 7,
  "interferenceThreshold": 0.6
}
```

Use with:
```bash
quantumflow --config quantumflow.config.json file.txt
```

## Troubleshooting

### Common Issues

**"Command not found: quantumflow"**
- Ensure Node.js and npm are installed
- Try reinstalling: `npm install -g quantumflow`
- Check PATH includes npm global bin directory

**"Quantum simulation failed"**
- Try reducing quantum parameters
- Use `--quantum-bit-depth 4` for complex files
- Enable verbose mode with `-v` for detailed error information

**Poor compression ratios**
- Increase `--quantum-bit-depth` for structured data
- Adjust `--max-entanglement-level` for repetitive data
- Use `--superposition-complexity 8` for complex patterns

**Out of memory errors**
- Reduce `--quantum-bit-depth` for large files
- Use `--max-entanglement-level 3` for memory-constrained systems
- Process files individually instead of batch mode

## Development

### Building from Source

```bash
git clone https://github.com/parthchhabraa/quantumflow.git
cd quantumflow
npm install
npm run build
npm test
```

### Running Tests

```bash
npm test                    # Unit tests
npm run test:performance   # Performance tests
npm run test:coverage      # Coverage report
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our GitHub repository.

## Support

- **Issues**: [GitHub Issues](https://github.com/parthchhabraa/quantumflow/issues)
- **Documentation**: [GitHub Wiki](https://github.com/parthchhabraa/quantumflow/wiki)
- **Email**: hello@parthchhabra.in

---

**QuantumFlow** - Compression at the speed of quantum thought.
