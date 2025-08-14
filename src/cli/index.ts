#!/usr/bin/env node

/**
 * QuantumFlow CLI Entry Point
 */

import { QuantumFlowCLI } from './QuantumFlowCLI';

async function main() {
  const cli = new QuantumFlowCLI();
  await cli.run();
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

if (require.main === module) {
  main().catch((error) => {
    console.error('CLI Error:', error);
    process.exit(1);
  });
}

export { QuantumFlowCLI } from './QuantumFlowCLI';