#!/usr/bin/env node
"use strict";
/**
 * QuantumFlow CLI Entry Point
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuantumFlowCLI = void 0;
const QuantumFlowCLI_1 = require("./QuantumFlowCLI");
async function main() {
    const cli = new QuantumFlowCLI_1.QuantumFlowCLI();
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
var QuantumFlowCLI_2 = require("./QuantumFlowCLI");
Object.defineProperty(exports, "QuantumFlowCLI", { enumerable: true, get: function () { return QuantumFlowCLI_2.QuantumFlowCLI; } });
//# sourceMappingURL=index.js.map