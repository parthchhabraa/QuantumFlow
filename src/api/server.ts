import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { compressionRoutes } from './routes/compression';
import { authRoutes } from './routes/auth';
import { batchRoutes } from './routes/batch';
import { cloudAuthRoutes } from './routes/cloud-auth';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

export class QuantumFlowAPIServer {
  private app: express.Application;
  private port: number;

  constructor(port: number = 3000) {
    this.app = express();
    this.port = port;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // Body parsing
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Request logging
    this.app.use(requestLogger);
  }

  private setupRoutes(): void {
    // Serve static frontend files
    const frontendPath = path.join(__dirname, '../frontend');
    this.app.use(express.static(frontendPath));

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/compression', compressionRoutes); // Remove auth middleware for demo
    this.app.use('/api/batch', batchRoutes);
    this.app.use('/api/cloud-auth', cloudAuthRoutes);

    // API documentation
    this.app.get('/api', (req, res) => {
      res.json({
        name: 'QuantumFlow API',
        version: '1.0.0',
        endpoints: {
          auth: {
            'POST /api/auth/register': 'Register a new user',
            'POST /api/auth/login': 'Login user',
            'POST /api/auth/refresh': 'Refresh access token'
          },
          compression: {
            'POST /api/compression/compress': 'Compress a file',
            'POST /api/compression/decompress': 'Decompress a file',
            'GET /api/compression/status/:jobId': 'Get compression job status',
            'GET /api/compression/download/:jobId': 'Download compressed/decompressed file'
          },
          batch: {
            'POST /api/batch/compress': 'Create batch compression job',
            'POST /api/batch/decompress': 'Create batch decompression job',
            'POST /api/batch/cloud/:provider': 'Create batch job from cloud storage',
            'GET /api/batch/status/:jobId': 'Get batch job status',
            'GET /api/batch/jobs': 'Get user batch jobs',
            'POST /api/batch/cancel/:jobId': 'Cancel batch job',
            'GET /api/batch/queue/status': 'Get queue status'
          },
          cloudAuth: {
            'GET /api/cloud-auth/authorize/:provider': 'Get cloud authorization URL',
            'POST /api/cloud-auth/callback/:provider': 'Handle OAuth callback',
            'POST /api/cloud-auth/refresh/:provider': 'Refresh access token',
            'POST /api/cloud-auth/test/:provider': 'Test cloud credentials',
            'POST /api/cloud-auth/files/:provider': 'List cloud files',
            'GET /api/cloud-auth/providers': 'Get supported providers'
          }
        }
      });
    });

    // Serve React app for all non-API routes
    this.app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(frontendPath, 'index.html'));
      }
    });
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public start(): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(this.port, () => {
        console.log(`QuantumFlow API Server running on port ${this.port}`);
        resolve();
      });
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}