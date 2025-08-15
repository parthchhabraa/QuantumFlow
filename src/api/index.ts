import { QuantumFlowAPIServer } from './server';

// Start the API server
const port = parseInt(process.env.PORT || '3000', 10);
const server = new QuantumFlowAPIServer(port);

server.start().catch(error => {
  console.error('Failed to start QuantumFlow API Server:', error);
  process.exit(1);
});

export { QuantumFlowAPIServer };