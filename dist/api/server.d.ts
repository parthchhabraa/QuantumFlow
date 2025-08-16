import express from 'express';
export declare class QuantumFlowAPIServer {
    private app;
    private port;
    constructor(port?: number);
    private setupMiddleware;
    private setupRoutes;
    private setupErrorHandling;
    start(): Promise<void>;
    getApp(): express.Application;
}
//# sourceMappingURL=server.d.ts.map