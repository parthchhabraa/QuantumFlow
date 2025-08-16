// Demo functionality for Quantum Compression Simulator

class QuantumCompressionDemo {
    constructor() {
        this.currentFile = null;
        this.compressionResult = null;
        this.init();
    }
    
    init() {
        this.setupFileUpload();
        this.setupCompressionControls();
        this.setupVisualization();
    }
    
    setupFileUpload() {
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');
        
        // Drag and drop functionality
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });
        
        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });
    }
    
    setupCompressionControls() {
        const compressionLevel = document.getElementById('compression-level');
        const compressionValue = document.getElementById('compression-value');
        const compressBtn = document.getElementById('compress-btn');
        const resetBtn = document.getElementById('reset-btn');
        
        // Update compression level display
        compressionLevel.addEventListener('input', (e) => {
            compressionValue.textContent = e.target.value;
        });
        
        // Compress button
        compressBtn.addEventListener('click', () => {
            this.compressFile();
        });
        
        // Reset button
        resetBtn.addEventListener('click', () => {
            this.resetDemo();
        });
    }
    
    setupVisualization() {
        // Initialize quantum state visualization
        this.createQuantumVisualization();
    }
    
    handleFileSelect(file) {
        this.currentFile = file;
        
        // Update file info
        document.getElementById('file-name').textContent = file.name;
        document.getElementById('file-size').textContent = this.formatFileSize(file.size);
        document.getElementById('file-type').textContent = file.type || 'Unknown';
        
        // Show file info and compression controls
        document.getElementById('file-info').style.display = 'block';
        document.getElementById('compression-controls').style.display = 'block';
        
        // Hide results if showing
        document.getElementById('results-section').style.display = 'none';
        
        // Update visualization
        this.updateVisualization('file-loaded');
    }
    
    async compressFile() {
        if (!this.currentFile) return;
        
        const compressBtn = document.getElementById('compress-btn');
        const btnText = compressBtn.querySelector('.btn-text');
        const btnLoader = compressBtn.querySelector('.btn-loader');
        
        // Show loading state
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';
        compressBtn.disabled = true;
        
        try {
            // Simulate compression process
            await this.simulateCompression();
            
            // Show results
            this.showCompressionResults();
            
        } catch (error) {
            console.error('Compression failed:', error);
            alert('Compression failed. Please try again.');
        } finally {
            // Reset button state
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
            compressBtn.disabled = false;
        }
    }
    
    async simulateCompression() {
        const algorithm = document.getElementById('algorithm-select').value;
        const level = parseInt(document.getElementById('compression-level').value);
        
        // Simulate processing time
        await this.delay(2000 + Math.random() * 2000);
        
        // Calculate simulated compression results
        const originalSize = this.currentFile.size;
        let compressionRatio;
        
        switch (algorithm) {
            case 'quantum':
                compressionRatio = 0.12 + (level * 0.02); // 12-32% remaining
                break;
            case 'entanglement':
                compressionRatio = 0.10 + (level * 0.025); // 10-35% remaining
                break;
            case 'interference':
                compressionRatio = 0.15 + (level * 0.015); // 15-30% remaining
                break;
            default:
                compressionRatio = 0.20;
        }
        
        const compressedSize = Math.floor(originalSize * compressionRatio);
        const spaceSaved = originalSize - compressedSize;
        const reductionPercentage = Math.floor((spaceSaved / originalSize) * 100);
        
        this.compressionResult = {
            originalSize,
            compressedSize,
            spaceSaved,
            reductionPercentage,
            algorithm,
            level
        };
        
        // Update visualization during compression
        this.updateVisualization('compressing');
        await this.delay(1000);
        this.updateVisualization('complete');
    }
    
    showCompressionResults() {
        const result = this.compressionResult;
        
        document.getElementById('original-size').textContent = this.formatFileSize(result.originalSize);
        document.getElementById('compressed-size').textContent = this.formatFileSize(result.compressedSize);
        document.getElementById('compression-ratio').textContent = `${result.reductionPercentage}%`;
        document.getElementById('space-saved').textContent = this.formatFileSize(result.spaceSaved);
        
        document.getElementById('results-section').style.display = 'block';
        
        // Setup download button
        const downloadBtn = document.getElementById('download-btn');
        downloadBtn.onclick = () => this.downloadCompressedFile();
        
        // Update metrics
        this.updateMetrics();
    }
    
    downloadCompressedFile() {
        if (!this.currentFile || !this.compressionResult) return;
        
        // Create a simulated compressed file
        const originalName = this.currentFile.name;
        const compressedName = originalName + '.qf';
        
        // Create a blob with simulated compressed data
        const compressedData = new Uint8Array(this.compressionResult.compressedSize);
        // Fill with some pattern to simulate compressed data
        for (let i = 0; i < compressedData.length; i++) {
            compressedData[i] = (i * 7 + 42) % 256;
        }
        
        const blob = new Blob([compressedData], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = compressedName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }
    
    resetDemo() {
        this.currentFile = null;
        this.compressionResult = null;
        
        // Reset file input
        document.getElementById('file-input').value = '';
        
        // Hide sections
        document.getElementById('file-info').style.display = 'none';
        document.getElementById('compression-controls').style.display = 'none';
        document.getElementById('results-section').style.display = 'none';
        
        // Reset visualization
        this.updateVisualization('reset');
        this.resetMetrics();
    }
    
    createQuantumVisualization() {
        const viz = document.getElementById('quantum-viz');
        
        // Create quantum state indicators
        const states = ['|0⟩', '|1⟩', '|+⟩', '|-⟩'];
        states.forEach((state, index) => {
            const indicator = document.getElementById(`state-${index + 1}`);
            if (indicator) {
                indicator.style.opacity = '0.3';
                indicator.style.transform = 'scale(0.8)';
            }
        });
    }
    
    updateVisualization(phase) {
        const states = ['state-1', 'state-2', 'state-3', 'state-4'];
        
        switch (phase) {
            case 'file-loaded':
                states.forEach((stateId, index) => {
                    const element = document.getElementById(stateId);
                    if (element) {
                        setTimeout(() => {
                            element.style.opacity = '0.6';
                            element.style.transform = 'scale(1)';
                        }, index * 200);
                    }
                });
                break;
                
            case 'compressing':
                states.forEach((stateId, index) => {
                    const element = document.getElementById(stateId);
                    if (element) {
                        element.style.animation = 'quantumPulse 1s ease-in-out infinite';
                        element.style.opacity = '1';
                        element.style.transform = 'scale(1.2)';
                    }
                });
                break;
                
            case 'complete':
                states.forEach((stateId) => {
                    const element = document.getElementById(stateId);
                    if (element) {
                        element.style.animation = 'none';
                        element.style.opacity = '1';
                        element.style.transform = 'scale(1)';
                        element.style.color = 'var(--primary-color)';
                    }
                });
                break;
                
            case 'reset':
                states.forEach((stateId) => {
                    const element = document.getElementById(stateId);
                    if (element) {
                        element.style.animation = 'none';
                        element.style.opacity = '0.3';
                        element.style.transform = 'scale(0.8)';
                        element.style.color = '';
                    }
                });
                break;
        }
    }
    
    updateMetrics() {
        if (!this.compressionResult) return;
        
        const efficiency = Math.min(95, 60 + this.compressionResult.level * 3);
        const entanglementPairs = Math.floor(this.compressionResult.compressedSize / 1024);
        const superpositionStates = Math.floor(efficiency / 10);
        
        this.animateMetric('quantum-efficiency', efficiency + '%');
        this.animateMetric('entanglement-pairs', entanglementPairs.toString());
        this.animateMetric('superposition-states', superpositionStates.toString());
    }
    
    resetMetrics() {
        document.getElementById('quantum-efficiency').textContent = '0%';
        document.getElementById('entanglement-pairs').textContent = '0';
        document.getElementById('superposition-states').textContent = '0';
    }
    
    animateMetric(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const isPercentage = targetValue.includes('%');
        const numericTarget = parseInt(targetValue);
        
        let current = 0;
        const increment = numericTarget / 30; // 30 steps
        
        const timer = setInterval(() => {
            current += increment;
            
            if (current >= numericTarget) {
                current = numericTarget;
                clearInterval(timer);
            }
            
            const displayValue = Math.floor(current);
            element.textContent = isPercentage ? displayValue + '%' : displayValue.toString();
        }, 50);
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize demo when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuantumCompressionDemo();
});

// Add CSS for demo-specific animations
const demoStyles = `
.drag-over {
    border-color: var(--primary-color) !important;
    background: rgba(0, 212, 255, 0.1) !important;
}

.upload-area {
    border: 2px dashed var(--glass-border);
    border-radius: 20px;
    padding: 3rem;
    text-align: center;
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    transition: all 0.3s ease;
    cursor: pointer;
}

.upload-area:hover {
    border-color: var(--primary-color);
    background: rgba(0, 212, 255, 0.05);
}

.upload-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.demo-section {
    min-height: 100vh;
    padding: 8rem 0 4rem;
    position: relative;
}

.demo-header {
    text-align: center;
    margin-bottom: 4rem;
}

.demo-header h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.demo-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    max-width: 1400px;
    margin: 0 auto;
}

.demo-card,
.visualization-card {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    padding: 2.5rem;
    backdrop-filter: blur(20px);
}

.demo-card h2,
.visualization-card h2 {
    margin-bottom: 2rem;
    color: var(--text-primary);
}

.file-info,
.compression-controls,
.results-section {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid var(--glass-border);
}

.info-grid,
.results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

.info-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
}

.info-label {
    color: var(--text-secondary);
}

.info-value {
    color: var(--text-primary);
    font-weight: 600;
}

.control-group {
    margin-bottom: 1.5rem;
}

.control-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--text-secondary);
}

.control-group select,
.control-group input[type="range"] {
    width: 100%;
    padding: 0.5rem;
    background: var(--background-light);
    border: 1px solid var(--glass-border);
    border-radius: 10px;
    color: var(--text-primary);
}

.result-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--glass-border);
    border-radius: 15px;
    padding: 1.5rem;
    text-align: center;
}

.result-label {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
}

.result-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-color);
}

.download-section {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 2rem;
}

.quantum-visualization {
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 15px;
    margin-bottom: 2rem;
}

.viz-placeholder {
    text-align: center;
    color: var(--text-secondary);
}

.quantum-state-display {
    display: flex;
    gap: 2rem;
    margin-bottom: 2rem;
    justify-content: center;
}

.state-indicator {
    width: 60px;
    height: 60px;
    border: 2px solid var(--glass-border);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    font-weight: 700;
    transition: all 0.3s ease;
}

.metrics-display {
    display: grid;
    gap: 1rem;
}

.metric {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
}

.metric-label {
    color: var(--text-secondary);
}

.metric-value {
    color: var(--primary-color);
    font-weight: 700;
}

@keyframes quantumPulse {
    0%, 100% {
        box-shadow: 0 0 10px var(--primary-color);
    }
    50% {
        box-shadow: 0 0 20px var(--primary-color), 0 0 30px var(--primary-color);
    }
}

@media (max-width: 768px) {
    .demo-container {
        grid-template-columns: 1fr;
        gap: 2rem;
    }
    
    .quantum-state-display {
        gap: 1rem;
    }
    
    .state-indicator {
        width: 50px;
        height: 50px;
        font-size: 1rem;
    }
    
    .download-section {
        flex-direction: column;
        align-items: center;
    }
}
`;

// Inject demo styles
const demoStyleSheet = document.createElement('style');
demoStyleSheet.textContent = demoStyles;
document.head.appendChild(demoStyleSheet);