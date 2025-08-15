# QuantumFlow API Reference

Complete API documentation for QuantumFlow v2.0 web platform and services.

## Table of Contents

- [Authentication](#authentication)
- [Compression API](#compression-api)
- [Cloud Storage API](#cloud-storage-api)
- [Video Conferencing API](#video-conferencing-api)
- [Progress Tracking](#progress-tracking)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [WebSocket API](#websocket-api)

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

### Login

**POST** `/auth/login`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "expiresIn": 86400
}
```

### Register

**POST** `/auth/register`

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### Refresh Token

**POST** `/auth/refresh`

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Logout

**POST** `/auth/logout`

Headers: `Authorization: Bearer <token>`

## Compression API

### Start Compression Job

**POST** `/compression/compress`

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `file`: File to compress (max 100MB)
- `quantumBitDepth`: Integer (2-16, default: 8)
- `maxEntanglementLevel`: Integer (1-8, default: 4)
- `superpositionComplexity`: Integer (1-10, default: 5)
- `interferenceThreshold`: Float (0.1-0.9, default: 0.5)
- `dataType`: String (text|binary|image|mixed, default: binary)

**Response:**
```json
{
  "message": "Compression job started successfully",
  "jobId": "job-123456789",
  "status": "pending",
  "configuration": {
    "quantumBitDepth": 8,
    "maxEntanglementLevel": 4,
    "superpositionComplexity": 5,
    "interferenceThreshold": 0.5
  },
  "estimatedProcessingTime": "2 minutes",
  "progressTracking": true
}
```

### Start Decompression Job

**POST** `/compression/decompress`

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `file`: Compressed .qf file

**Response:**
```json
{
  "message": "Decompression job started successfully",
  "jobId": "job-987654321",
  "status": "pending",
  "progressTracking": true
}
```

### Get Job Status

**GET** `/compression/status/{jobId}`

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "jobId": "job-123456789",
  "status": "completed",
  "progress": 100,
  "type": "compress",
  "originalFileName": "document.pdf",
  "configuration": {
    "quantumBitDepth": 8,
    "maxEntanglementLevel": 4,
    "superpositionComplexity": 5,
    "interferenceThreshold": 0.5
  },
  "metrics": {
    "originalSize": 5242880,
    "compressedSize": 3670016,
    "compressionRatio": 30.0,
    "processingTime": 15500,
    "quantumEfficiency": 87.3
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "completedAt": "2024-01-15T10:30:15Z",
  "statusMessage": "Job completed successfully - Compression ratio: 30.0%"
}
```

**Status Values:**
- `pending`: Job queued for processing
- `processing`: Job currently being processed
- `completed`: Job completed successfully
- `failed`: Job failed with errors

### Download Result

**GET** `/compression/download/{jobId}`

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
- Content-Type: `application/octet-stream`
- Content-Disposition: `attachment; filename="compressed-file.qf"`

### List Jobs

**GET** `/compression/jobs`

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: Filter by status (pending|processing|completed|failed)
- `type`: Filter by type (compress|decompress)
- `limit`: Number of results (default: 50, max: 100)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "jobs": [
    {
      "jobId": "job-123456789",
      "status": "completed",
      "type": "compress",
      "originalFileName": "document.pdf",
      "createdAt": "2024-01-15T10:30:00Z",
      "completedAt": "2024-01-15T10:30:15Z",
      "metrics": {
        "compressionRatio": 30.0,
        "processingTime": 15500
      }
    }
  ],
  "total": 25,
  "limit": 50,
  "offset": 0
}
```

### Delete Job

**DELETE** `/compression/jobs/{jobId}`

**Headers:**
- `Authorization: Bearer <token>`

## Cloud Storage API

### List Providers

**GET** `/cloud/providers`

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "providers": [
    {
      "id": "aws-s3",
      "name": "Amazon S3",
      "connected": true,
      "lastSync": "2024-01-15T10:30:00Z"
    },
    {
      "id": "google-drive",
      "name": "Google Drive",
      "connected": false,
      "lastSync": null
    },
    {
      "id": "dropbox",
      "name": "Dropbox",
      "connected": true,
      "lastSync": "2024-01-15T09:15:00Z"
    }
  ]
}
```

### Connect Provider

**POST** `/cloud/connect/{provider}`

**Headers:**
- `Authorization: Bearer <token>`

**Body (AWS S3):**
```json
{
  "accessKeyId": "AKIAIOSFODNN7EXAMPLE",
  "secretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  "region": "us-west-2"
}
```

**Body (Google Drive/Dropbox):**
```json
{
  "authCode": "authorization_code_from_oauth"
}
```

### List Files

**GET** `/cloud/files`

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `provider`: Provider ID (aws-s3|google-drive|dropbox)
- `path`: Directory path (default: root)
- `limit`: Number of results (default: 50)
- `type`: File type filter (file|folder|all, default: all)

**Response:**
```json
{
  "files": [
    {
      "id": "file-123",
      "name": "document.pdf",
      "type": "file",
      "size": 5242880,
      "path": "/documents/document.pdf",
      "modifiedAt": "2024-01-15T10:30:00Z",
      "provider": "aws-s3"
    },
    {
      "id": "folder-456",
      "name": "images",
      "type": "folder",
      "path": "/images/",
      "modifiedAt": "2024-01-14T15:20:00Z",
      "provider": "aws-s3"
    }
  ],
  "total": 25,
  "path": "/documents/",
  "provider": "aws-s3"
}
```

### Upload File

**POST** `/cloud/upload`

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body:**
```json
{
  "provider": "aws-s3",
  "path": "/compressed-files/",
  "jobId": "job-123456789",
  "fileName": "compressed-document.qf"
}
```

### Download File

**POST** `/cloud/download`

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body:**
```json
{
  "provider": "google-drive",
  "fileId": "file-123",
  "path": "/documents/document.pdf"
}
```

**Response:**
```json
{
  "downloadUrl": "https://temporary-download-url.com/file",
  "expiresAt": "2024-01-15T11:30:00Z"
}
```

## Video Conferencing API

### Create Meeting Room

**POST** `/video/rooms`

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Team Meeting",
  "maxParticipants": 10,
  "compressionSettings": {
    "baseQuality": "medium",
    "adaptiveQuality": true,
    "quantumCompressionLevel": 6,
    "bandwidthThreshold": 5
  },
  "recordingEnabled": true,
  "password": "optional-password"
}
```

**Response:**
```json
{
  "roomId": "room-123456",
  "roomCode": "ABC-DEF-GHI",
  "name": "Team Meeting",
  "joinUrl": "https://quantumflow.com/video/room-123456",
  "hostToken": "host-token-xyz",
  "createdAt": "2024-01-15T10:30:00Z",
  "expiresAt": "2024-01-15T18:30:00Z"
}
```

### Join Meeting Room

**POST** `/video/rooms/{roomId}/join`

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "displayName": "John Doe",
  "password": "optional-password",
  "audioEnabled": true,
  "videoEnabled": true
}
```

**Response:**
```json
{
  "participantId": "participant-789",
  "participantToken": "participant-token-abc",
  "iceServers": [
    {
      "urls": "stun:stun.quantumflow.com:3478"
    },
    {
      "urls": "turn:turn.quantumflow.com:3478",
      "username": "user123",
      "credential": "pass456"
    }
  ],
  "compressionSettings": {
    "baseQuality": "medium",
    "quantumCompressionLevel": 6
  }
}
```

### List Participants

**GET** `/video/rooms/{roomId}/participants`

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "participants": [
    {
      "participantId": "participant-789",
      "displayName": "John Doe",
      "isHost": true,
      "audioEnabled": true,
      "videoEnabled": true,
      "joinedAt": "2024-01-15T10:30:00Z",
      "connectionQuality": "good"
    }
  ],
  "totalParticipants": 1,
  "maxParticipants": 10
}
```

### Start Recording

**POST** `/video/rooms/{roomId}/recording/start`

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "compressionLevel": 8,
  "includeAudio": true,
  "includeVideo": true,
  "includeScreenShare": true
}
```

### Stop Recording

**POST** `/video/rooms/{roomId}/recording/stop`

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "recordingId": "recording-456",
  "duration": 3600,
  "fileSize": 157286400,
  "compressionRatio": 45.2,
  "downloadUrl": "https://recordings.quantumflow.com/recording-456.qf"
}
```

## Progress Tracking

### Server-Sent Events

**GET** `/compression/progress/{jobId}`

**Headers:**
- `Authorization: Bearer <token>`
- `Accept: text/event-stream`

**Response Stream:**
```
data: {"type":"connection","operationId":"job-123456","message":"Progress tracking started"}

data: {"type":"progress","operationId":"job-123456","progress":{"currentStep":"initialization","stepProgress":1.0,"overallProgress":0.05,"elapsedTime":500,"estimatedTimeRemaining":9500,"currentOperation":"Setting up quantum compression engine","processedBytes":0,"totalBytes":10485760,"throughput":0,"memoryUsage":52428800,"errors":[],"warnings":[]},"timestamp":"2024-01-15T10:30:00.500Z"}

data: {"type":"progress","operationId":"job-123456","progress":{"currentStep":"quantum_state_preparation","stepProgress":0.6,"overallProgress":0.32,"elapsedTime":3200,"estimatedTimeRemaining":6800,"currentOperation":"Converting data to quantum states","processedBytes":6291456,"totalBytes":10485760,"throughput":1966080,"memoryUsage":104857600,"errors":[],"warnings":["High entropy data detected"]},"timestamp":"2024-01-15T10:30:03.200Z"}

data: {"type":"complete","operationId":"job-123456","message":"Compression completed successfully","timestamp":"2024-01-15T10:30:10.000Z"}
```

### Progress Polling

**GET** `/compression/status/{jobId}?includeProgress=true`

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "jobId": "job-123456",
  "status": "processing",
  "progress": 65,
  "currentPhase": "entanglement_detection",
  "phaseProgress": 80,
  "elapsedTime": 8500,
  "estimatedTimeRemaining": 4500,
  "throughput": 1.2,
  "memoryUsage": 134217728,
  "errors": [],
  "warnings": ["Configuration not optimal for this data type"]
}
```

## Error Handling

### Error Response Format

All API errors follow this format:

```json
{
  "error": {
    "code": "COMPRESSION_MEMORY_ERROR",
    "message": "The file is too large or complex for the current settings.",
    "category": "COMPRESSION",
    "severity": "HIGH",
    "timestamp": "2024-01-15T10:30:00Z",
    "context": {
      "operation": "API compression",
      "fileName": "large-file.bin",
      "fileSize": 104857600
    },
    "recoverySuggestions": [
      {
        "action": "Reduce quantum bit depth",
        "description": "Current bit depth: 12. Try reducing to 8",
        "priority": 5
      },
      {
        "action": "Process in smaller chunks",
        "description": "Break the file into smaller pieces",
        "priority": 4
      }
    ],
    "technicalDetails": "Quantum state allocation failed during superposition analysis"
  }
}
```

### HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **202 Accepted**: Request accepted for processing
- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource conflict
- **413 Payload Too Large**: File size exceeds limits
- **422 Unprocessable Entity**: Valid request but processing failed
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error
- **503 Service Unavailable**: Service temporarily unavailable

### Error Categories

- **VALIDATION**: Invalid input parameters
- **AUTHENTICATION**: Authentication/authorization errors
- **FILE_SYSTEM**: File access and storage errors
- **COMPRESSION**: Quantum compression algorithm errors
- **NETWORK**: Network and connectivity errors
- **MEMORY**: Memory and resource errors
- **CONFIGURATION**: Configuration and parameter errors

## Rate Limiting

### Limits

- **Authentication**: 10 requests per minute per IP
- **File Upload**: 5 uploads per minute per user
- **API Requests**: 100 requests per minute per user
- **Progress Updates**: 60 requests per minute per job

### Headers

Rate limit information is included in response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248600
X-RateLimit-Retry-After: 60
```

### Rate Limit Exceeded Response

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

## WebSocket API

### Connection

**WebSocket** `/ws`

**Query Parameters:**
- `token`: JWT authentication token

### Message Format

All WebSocket messages use JSON format:

```json
{
  "type": "message_type",
  "data": { ... },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Subscribe to Job Progress

**Send:**
```json
{
  "type": "subscribe",
  "jobId": "job-123456"
}
```

**Receive:**
```json
{
  "type": "progress",
  "jobId": "job-123456",
  "data": {
    "currentStep": "quantum_state_preparation",
    "overallProgress": 0.35,
    "elapsedTime": 3500,
    "estimatedTimeRemaining": 6500
  },
  "timestamp": "2024-01-15T10:30:03.500Z"
}
```

### Video Conference Events

**Join Room:**
```json
{
  "type": "join_room",
  "roomId": "room-123456",
  "participantToken": "participant-token-abc"
}
```

**Participant Events:**
```json
{
  "type": "participant_joined",
  "roomId": "room-123456",
  "participant": {
    "participantId": "participant-789",
    "displayName": "John Doe",
    "audioEnabled": true,
    "videoEnabled": true
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Handling

**Error Message:**
```json
{
  "type": "error",
  "error": {
    "code": "WEBSOCKET_AUTH_FAILED",
    "message": "Invalid authentication token"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## SDK Examples

### JavaScript/Node.js

```javascript
class QuantumFlowAPI {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async compressFile(file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.entries(options).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await fetch(`${this.baseUrl}/compression/compress`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }

    return response.json();
  }

  async getJobStatus(jobId) {
    const response = await fetch(`${this.baseUrl}/compression/status/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });

    return response.json();
  }

  subscribeToProgress(jobId, callback) {
    const eventSource = new EventSource(
      `${this.baseUrl}/compression/progress/${jobId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      }
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    return eventSource;
  }
}

// Usage
const api = new QuantumFlowAPI('https://api.quantumflow.com', 'your-token');

const fileInput = document.getElementById('file-input');
const file = fileInput.files[0];

try {
  const job = await api.compressFile(file, {
    quantumBitDepth: 8,
    maxEntanglementLevel: 4
  });

  console.log('Job started:', job.jobId);

  // Subscribe to progress
  const eventSource = api.subscribeToProgress(job.jobId, (progress) => {
    console.log('Progress:', progress);
  });

  // Poll for completion
  const checkStatus = async () => {
    const status = await api.getJobStatus(job.jobId);
    if (status.status === 'completed') {
      console.log('Job completed!', status.metrics);
      eventSource.close();
    } else if (status.status === 'failed') {
      console.error('Job failed:', status.error);
      eventSource.close();
    } else {
      setTimeout(checkStatus, 1000);
    }
  };

  checkStatus();
} catch (error) {
  console.error('Compression failed:', error.message);
}
```

### Python

```python
import requests
import json
from typing import Optional, Dict, Any

class QuantumFlowAPI:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url
        self.token = token
        self.headers = {'Authorization': f'Bearer {token}'}
    
    def compress_file(self, file_path: str, options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        url = f"{self.base_url}/compression/compress"
        
        with open(file_path, 'rb') as f:
            files = {'file': f}
            data = options or {}
            
            response = requests.post(url, headers=self.headers, files=files, data=data)
            response.raise_for_status()
            
            return response.json()
    
    def get_job_status(self, job_id: str) -> Dict[str, Any]:
        url = f"{self.base_url}/compression/status/{job_id}"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()
    
    def download_result(self, job_id: str, output_path: str):
        url = f"{self.base_url}/compression/download/{job_id}"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        
        with open(output_path, 'wb') as f:
            f.write(response.content)

# Usage
api = QuantumFlowAPI('https://api.quantumflow.com', 'your-token')

try:
    job = api.compress_file('document.pdf', {
        'quantumBitDepth': 8,
        'maxEntanglementLevel': 4
    })
    
    print(f"Job started: {job['jobId']}")
    
    # Poll for completion
    import time
    while True:
        status = api.get_job_status(job['jobId'])
        print(f"Status: {status['status']} ({status['progress']}%)")
        
        if status['status'] == 'completed':
            print("Job completed!")
            api.download_result(job['jobId'], 'compressed-document.qf')
            break
        elif status['status'] == 'failed':
            print(f"Job failed: {status.get('error', 'Unknown error')}")
            break
        
        time.sleep(1)

except requests.exceptions.RequestException as e:
    print(f"API error: {e}")
```

---

For more examples and detailed guides, see the [Web Platform Guide](WEB_PLATFORM_GUIDE.md) and [Error Handling Guide](ERROR_HANDLING_GUIDE.md).