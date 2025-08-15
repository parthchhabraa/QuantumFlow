# QuantumFlow Progress Tracking Guide

QuantumFlow v2.0 introduces advanced progress tracking with real-time updates, time estimates, and detailed phase information. This guide explains how to use and customize the progress tracking system.

## Table of Contents

- [Overview](#overview)
- [CLI Progress Tracking](#cli-progress-tracking)
- [Web Platform Progress](#web-platform-progress)
- [API Progress Integration](#api-progress-integration)
- [Customization Options](#customization-options)
- [Troubleshooting](#troubleshooting)

## Overview

### Progress Tracking Features

- **Real-time Updates**: Live progress updates during compression/decompression
- **Phase Information**: Detailed information about current processing phase
- **Time Estimates**: Elapsed time and estimated time remaining
- **Throughput Monitoring**: Processing speed in MB/s
- **Memory Usage**: Current memory consumption tracking
- **Error/Warning Tracking**: Count and details of issues encountered

### Progress Phases

#### Compression Phases
1. **Initialization** (5%): Setting up quantum compression engine
2. **Data Analysis** (10%): Analyzing input data characteristics
3. **Quantum State Preparation** (20%): Converting data to quantum states
4. **Superposition Analysis** (25%): Analyzing quantum superposition patterns
5. **Entanglement Detection** (20%): Finding correlated quantum patterns
6. **Interference Optimization** (15%): Optimizing quantum interference patterns
7. **Data Encoding** (5%): Encoding compressed quantum data

#### Decompression Phases
1. **Initialization** (5%): Setting up quantum decompression engine
2. **Data Validation** (10%): Validating compressed quantum data
3. **Quantum State Reconstruction** (25%): Reconstructing quantum states
4. **Interference Reversal** (20%): Reversing quantum interference patterns
5. **Entanglement Reconstruction** (20%): Reconstructing entanglement relationships
6. **Superposition Collapse** (15%): Collapsing superposition states
7. **Data Reconstruction** (5%): Converting quantum states back to classical data

## CLI Progress Tracking

### Basic Usage

```bash
# Enable progress bar
quantumflow --progress file.txt

# Enable progress with verbose output
quantumflow --progress --verbose file.txt

# Show time estimates
quantumflow --progress --show-time-estimate file.txt

# Show throughput information
quantumflow --progress --show-throughput file.txt
```

### Progress Bar Display

```
[████████████████████████████████████████] 75% (3/4) ETA: 30s - quantum_state_preparation
```

Components:
- **Progress Bar**: Visual representation of completion
- **Percentage**: Numeric progress (0-100%)
- **Current/Total**: Current step out of total steps
- **ETA**: Estimated time remaining
- **Current Phase**: Name of current processing phase

### Verbose Progress Output

```bash
quantumflow --progress --verbose file.txt
```

Output:
```
🚀 Starting Compression of file.txt...

📋 Initialization: Setting up quantum compression engine
✅ Initialization completed in 0.5s

📋 Data Analysis: Analyzing input data characteristics
  - File size: 10.5 MB
  - Estimated entropy: 0.73
  - Data type: binary
✅ Data Analysis completed in 1.2s

📋 Quantum State Preparation: Converting data to quantum states
  - Chunk size: 1024 bytes
  - Quantum bit depth: 8
  - States created: 10,752
⚠️  Warning: High entropy data detected, consider reducing quantum bit depth
✅ Quantum State Preparation completed in 3.8s

📋 Superposition Analysis: Analyzing quantum superposition patterns
  - Superposition groups: 1,344
  - Pattern threshold: 0.5
  - Dominant patterns found: 89
✅ Superposition Analysis completed in 4.2s

📋 Entanglement Detection: Finding correlated quantum patterns
  - Correlation threshold: 0.5
  - Entanglement pairs found: 156
  - Average correlation strength: 0.67
✅ Entanglement Detection completed in 2.9s

📋 Interference Optimization: Optimizing quantum interference patterns
  - Constructive patterns: 234
  - Destructive patterns: 89
  - Optimization iterations: 3
✅ Interference Optimization completed in 2.1s

📋 Data Encoding: Encoding compressed quantum data
  - Quantum states encoded: 10,752
  - Metadata size: 2.3 KB
✅ Data Encoding completed in 0.8s

✅ Compression completed in 15.5s
📊 Compression Statistics:
  - Original size: 10.5 MB
  - Compressed size: 7.2 MB
  - Compression ratio: 31.4%
  - Processing speed: 0.68 MB/s
  - Quantum efficiency: 87.3%
```

### Batch Processing Progress

```bash
quantumflow --batch --progress *.txt
```

Output:
```
Starting batch compression of 5 files...

[████████████████████████████████████████] 100% (1/5) ETA: 2m 15s - file1.txt
Processing: file1.txt (2.3 MB) - quantum_state_preparation

Batch Processing Summary:
Total files: 5
Processed: 3
Failed: 0
Total time: 45.2s
Average compression ratio: 28.7%
```

## Web Platform Progress

### Real-time Progress Display

The web platform provides rich progress visualization:

#### Progress Components
- **Overall Progress Bar**: Shows total completion percentage
- **Phase Progress Bar**: Shows progress within current phase
- **Phase Information**: Current phase name and description
- **Time Information**: Elapsed time and ETA
- **Throughput Graph**: Real-time processing speed chart
- **Memory Usage Graph**: Memory consumption over time

#### Progress Interface Elements

```html
<!-- Progress Container -->
<div class="progress-container">
  <!-- Overall Progress -->
  <div class="overall-progress">
    <div class="progress-bar">
      <div class="progress-fill" style="width: 75%"></div>
    </div>
    <span class="progress-text">75% Complete</span>
  </div>
  
  <!-- Current Phase -->
  <div class="current-phase">
    <h3>Quantum State Preparation</h3>
    <p>Converting data to quantum states</p>
    <div class="phase-progress">
      <div class="progress-bar">
        <div class="progress-fill" style="width: 60%"></div>
      </div>
    </div>
  </div>
  
  <!-- Statistics -->
  <div class="progress-stats">
    <div class="stat">
      <label>Elapsed Time:</label>
      <span>2m 15s</span>
    </div>
    <div class="stat">
      <label>ETA:</label>
      <span>1m 30s</span>
    </div>
    <div class="stat">
      <label>Throughput:</label>
      <span>2.3 MB/s</span>
    </div>
    <div class="stat">
      <label>Memory Usage:</label>
      <span>156 MB</span>
    </div>
  </div>
</div>
```

### Progress Events

The web platform uses Server-Sent Events (SSE) for real-time updates:

```javascript
// Connect to progress stream
const eventSource = new EventSource(`/api/compression/progress/${jobId}`);

eventSource.onmessage = (event) => {
  const progress = JSON.parse(event.data);
  updateProgressDisplay(progress);
};

function updateProgressDisplay(progress) {
  // Update overall progress
  document.getElementById('overall-progress').style.width = 
    `${progress.overallProgress * 100}%`;
  
  // Update current phase
  document.getElementById('current-phase').textContent = 
    progress.currentStep;
  
  // Update time estimates
  document.getElementById('elapsed-time').textContent = 
    formatDuration(progress.elapsedTime);
  document.getElementById('eta').textContent = 
    formatDuration(progress.estimatedTimeRemaining);
  
  // Update throughput
  if (progress.throughput) {
    document.getElementById('throughput').textContent = 
      `${formatBytes(progress.throughput)}/s`;
  }
  
  // Update memory usage
  if (progress.memoryUsage) {
    document.getElementById('memory-usage').textContent = 
      formatBytes(progress.memoryUsage);
  }
  
  // Handle errors and warnings
  if (progress.errors.length > 0) {
    showErrors(progress.errors);
  }
  if (progress.warnings.length > 0) {
    showWarnings(progress.warnings);
  }
}
```

### Progress Visualization

#### Charts and Graphs

```javascript
// Throughput chart
const throughputChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: timeLabels,
    datasets: [{
      label: 'Throughput (MB/s)',
      data: throughputData,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'MB/s'
        }
      }
    }
  }
});

// Memory usage chart
const memoryChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: timeLabels,
    datasets: [{
      label: 'Memory Usage (MB)',
      data: memoryData,
      borderColor: 'rgb(255, 99, 132)',
      tension: 0.1
    }]
  }
});
```

## API Progress Integration

### Progress Endpoints

#### Start Progress Tracking
```http
POST /api/compression/compress
Content-Type: multipart/form-data
X-Track-Progress: true

{
  "file": <file_data>,
  "quantumBitDepth": 8,
  "trackProgress": true
}
```

Response:
```json
{
  "jobId": "job-123456",
  "status": "pending",
  "progressTracking": true,
  "progressEndpoint": "/api/compression/progress/job-123456"
}
```

#### Get Progress Status
```http
GET /api/compression/progress/{jobId}
Accept: text/event-stream
```

Response (Server-Sent Events):
```
data: {"type":"progress","jobId":"job-123456","progress":{"currentStep":"initialization","stepProgress":1.0,"overallProgress":0.05,"elapsedTime":500,"estimatedTimeRemaining":9500,"currentOperation":"Setting up quantum compression engine","processedBytes":0,"totalBytes":10485760,"throughput":0,"memoryUsage":52428800,"errors":[],"warnings":[]}}

data: {"type":"progress","jobId":"job-123456","progress":{"currentStep":"quantum_state_preparation","stepProgress":0.3,"overallProgress":0.26,"elapsedTime":2500,"estimatedTimeRemaining":7000,"currentOperation":"Converting data to quantum states","processedBytes":3145728,"totalBytes":10485760,"throughput":1258291,"memoryUsage":104857600,"errors":[],"warnings":["High entropy data detected"]}}
```

#### WebSocket Progress
```javascript
const ws = new WebSocket('ws://localhost:3000/api/compression/ws');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'subscribe',
    jobId: 'job-123456'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'progress') {
    handleProgressUpdate(data.progress);
  }
};
```

### Progress Data Structure

```typescript
interface ProgressState {
  currentStep: string;           // Current phase ID
  stepProgress: number;          // Progress within current step (0-1)
  overallProgress: number;       // Overall progress (0-1)
  startTime: number;            // Operation start timestamp
  elapsedTime: number;          // Elapsed time in milliseconds
  estimatedTimeRemaining: number; // ETA in milliseconds
  currentOperation: string;      // Human-readable current operation
  processedBytes?: number;       // Bytes processed so far
  totalBytes?: number;          // Total bytes to process
  throughput?: number;          // Processing speed (bytes/second)
  memoryUsage?: number;         // Current memory usage in bytes
  errors: string[];             // Error messages
  warnings: string[];           // Warning messages
}
```

## Customization Options

### CLI Customization

#### Progress Bar Appearance
```bash
# Custom progress bar width
quantumflow --progress --bar-width 60 file.txt

# Disable colors
quantumflow --progress --no-colors file.txt

# Custom update interval (milliseconds)
quantumflow --progress --update-interval 500 file.txt

# Minimal progress output
quantumflow --progress --minimal file.txt
```

#### Configuration File
```json
{
  "progress": {
    "showProgressBar": true,
    "showPercentage": true,
    "showTimeEstimate": true,
    "showThroughput": true,
    "showMemoryUsage": false,
    "updateInterval": 250,
    "barWidth": 40,
    "useColors": true,
    "logLevel": "normal"
  }
}
```

### Web Platform Customization

#### CSS Customization
```css
/* Custom progress bar styling */
.progress-bar {
  height: 20px;
  background-color: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  transition: width 0.3s ease;
}

/* Custom phase indicator */
.current-phase {
  padding: 15px;
  background-color: #f8f9fa;
  border-left: 4px solid #007bff;
  margin: 10px 0;
}

/* Statistics grid */
.progress-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 20px;
}
```

#### JavaScript Customization
```javascript
// Custom progress update handler
function customProgressHandler(progress) {
  // Custom logic for progress updates
  updateCustomVisualization(progress);
  
  // Custom notifications
  if (progress.overallProgress > 0.5 && !notifiedHalfway) {
    showNotification('Compression is halfway complete!');
    notifiedHalfway = true;
  }
  
  // Custom error handling
  if (progress.errors.length > 0) {
    handleCustomErrors(progress.errors);
  }
}

// Custom visualization
function updateCustomVisualization(progress) {
  // Update custom charts, animations, etc.
  updatePhaseAnimation(progress.currentStep);
  updateThroughputGraph(progress.throughput);
  updateMemoryGauge(progress.memoryUsage);
}
```

### API Integration Customization

#### Custom Progress Polling
```javascript
class CustomProgressTracker {
  constructor(jobId, options = {}) {
    this.jobId = jobId;
    this.options = {
      pollInterval: 1000,
      timeout: 300000, // 5 minutes
      ...options
    };
    this.callbacks = [];
  }
  
  start() {
    this.pollTimer = setInterval(() => {
      this.fetchProgress();
    }, this.options.pollInterval);
    
    // Set timeout
    this.timeoutTimer = setTimeout(() => {
      this.stop();
      this.notifyCallbacks({ type: 'timeout' });
    }, this.options.timeout);
  }
  
  async fetchProgress() {
    try {
      const response = await fetch(`/api/compression/status/${this.jobId}`);
      const data = await response.json();
      this.notifyCallbacks({ type: 'progress', data });
    } catch (error) {
      this.notifyCallbacks({ type: 'error', error });
    }
  }
  
  onProgress(callback) {
    this.callbacks.push(callback);
  }
  
  stop() {
    if (this.pollTimer) clearInterval(this.pollTimer);
    if (this.timeoutTimer) clearTimeout(this.timeoutTimer);
  }
}

// Usage
const tracker = new CustomProgressTracker('job-123456', {
  pollInterval: 500,
  timeout: 600000
});

tracker.onProgress((event) => {
  if (event.type === 'progress') {
    updateUI(event.data);
  } else if (event.type === 'error') {
    handleError(event.error);
  }
});

tracker.start();
```

## Troubleshooting

### Common Issues

#### Progress Not Updating
**Symptoms**: Progress bar stuck or not moving
**Solutions**:
1. Check network connection (web platform)
2. Verify operation is still running
3. Increase update interval
4. Check for JavaScript errors (web platform)
5. Restart the operation

#### Inaccurate Time Estimates
**Symptoms**: ETA wildly fluctuating or incorrect
**Solutions**:
1. Allow more time for accurate estimation (first 10-20% of operation)
2. Check system performance (CPU/memory usage)
3. Verify stable processing conditions
4. Consider file complexity variations

#### Memory Usage Spikes
**Symptoms**: Memory usage increasing unexpectedly
**Solutions**:
1. Monitor for memory leaks
2. Reduce quantum parameters
3. Process smaller files
4. Restart application periodically

#### Progress Events Missing
**Symptoms**: Some progress updates not received
**Solutions**:
1. Check network stability
2. Verify event source connection
3. Implement reconnection logic
4. Use polling as fallback

### Debugging Progress Issues

#### Enable Debug Logging
```bash
# CLI debug mode
quantumflow --progress --verbose --debug file.txt

# Web platform debug
# Open browser console and enable verbose logging
localStorage.setItem('quantumflow-debug', 'true');
```

#### Monitor Network Traffic
```javascript
// Monitor SSE connection
const eventSource = new EventSource('/api/compression/progress/job-123456');

eventSource.onerror = (error) => {
  console.error('SSE connection error:', error);
  // Implement reconnection logic
};

eventSource.onopen = () => {
  console.log('SSE connection established');
};
```

#### Performance Monitoring
```javascript
// Monitor progress update performance
let lastUpdate = Date.now();

function onProgressUpdate(progress) {
  const now = Date.now();
  const timeSinceLastUpdate = now - lastUpdate;
  
  if (timeSinceLastUpdate > 5000) {
    console.warn('Progress update delay:', timeSinceLastUpdate, 'ms');
  }
  
  lastUpdate = now;
  updateUI(progress);
}
```

### Best Practices

1. **Graceful Degradation**: Always provide fallback when progress tracking fails
2. **User Feedback**: Show meaningful messages during long operations
3. **Error Handling**: Handle progress errors without breaking the main operation
4. **Performance**: Don't let progress tracking impact compression performance
5. **Accessibility**: Ensure progress indicators are accessible to screen readers

---

For more information, see the [Web Platform Guide](WEB_PLATFORM_GUIDE.md) and [Error Handling Guide](ERROR_HANDLING_GUIDE.md).