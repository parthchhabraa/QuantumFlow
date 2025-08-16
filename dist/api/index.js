"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuantumFlowAPIServer = void 0;
const server_1 = require("./server");
Object.defineProperty(exports, "QuantumFlowAPIServer", { enumerable: true, get: function () { return server_1.QuantumFlowAPIServer; } });
// Start the API server
const port = parseInt(process.env.PORT || '3000', 10);
const server = new server_1.QuantumFlowAPIServer(port);
server.start().catch(error => {
    console.error('Failed to start QuantumFlow API Server:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map