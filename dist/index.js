"use strict";
/**
 * QuantumFlow by eliomatters
 * Quantum-inspired compression algorithm
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuantumFlowCLI = exports.ProbabilityAnalyzer = exports.PatternRecognizer = exports.SuperpositionProcessor = exports.DataChunker = exports.QuantumPhaseAssigner = exports.QuantumStateConverter = exports.CompressedQuantumData = exports.QuantumConfig = exports.EntanglementPair = exports.SuperpositionState = exports.QuantumStateVector = exports.QuantumMath = exports.Complex = void 0;
var Complex_1 = require("./math/Complex");
Object.defineProperty(exports, "Complex", { enumerable: true, get: function () { return Complex_1.Complex; } });
var QuantumMath_1 = require("./math/QuantumMath");
Object.defineProperty(exports, "QuantumMath", { enumerable: true, get: function () { return QuantumMath_1.QuantumMath; } });
var QuantumStateVector_1 = require("./models/QuantumStateVector");
Object.defineProperty(exports, "QuantumStateVector", { enumerable: true, get: function () { return QuantumStateVector_1.QuantumStateVector; } });
var SuperpositionState_1 = require("./models/SuperpositionState");
Object.defineProperty(exports, "SuperpositionState", { enumerable: true, get: function () { return SuperpositionState_1.SuperpositionState; } });
var EntanglementPair_1 = require("./models/EntanglementPair");
Object.defineProperty(exports, "EntanglementPair", { enumerable: true, get: function () { return EntanglementPair_1.EntanglementPair; } });
var QuantumConfig_1 = require("./models/QuantumConfig");
Object.defineProperty(exports, "QuantumConfig", { enumerable: true, get: function () { return QuantumConfig_1.QuantumConfig; } });
var CompressedQuantumData_1 = require("./models/CompressedQuantumData");
Object.defineProperty(exports, "CompressedQuantumData", { enumerable: true, get: function () { return CompressedQuantumData_1.CompressedQuantumData; } });
var QuantumStateConverter_1 = require("./core/QuantumStateConverter");
Object.defineProperty(exports, "QuantumStateConverter", { enumerable: true, get: function () { return QuantumStateConverter_1.QuantumStateConverter; } });
var QuantumPhaseAssigner_1 = require("./core/QuantumPhaseAssigner");
Object.defineProperty(exports, "QuantumPhaseAssigner", { enumerable: true, get: function () { return QuantumPhaseAssigner_1.QuantumPhaseAssigner; } });
var DataChunker_1 = require("./core/DataChunker");
Object.defineProperty(exports, "DataChunker", { enumerable: true, get: function () { return DataChunker_1.DataChunker; } });
var SuperpositionProcessor_1 = require("./core/SuperpositionProcessor");
Object.defineProperty(exports, "SuperpositionProcessor", { enumerable: true, get: function () { return SuperpositionProcessor_1.SuperpositionProcessor; } });
var PatternRecognizer_1 = require("./core/PatternRecognizer");
Object.defineProperty(exports, "PatternRecognizer", { enumerable: true, get: function () { return PatternRecognizer_1.PatternRecognizer; } });
var ProbabilityAnalyzer_1 = require("./core/ProbabilityAnalyzer");
Object.defineProperty(exports, "ProbabilityAnalyzer", { enumerable: true, get: function () { return ProbabilityAnalyzer_1.ProbabilityAnalyzer; } });
// Export CLI components
var QuantumFlowCLI_1 = require("./cli/QuantumFlowCLI");
Object.defineProperty(exports, "QuantumFlowCLI", { enumerable: true, get: function () { return QuantumFlowCLI_1.QuantumFlowCLI; } });
// Main entry point for CLI usage
if (require.main === module) {
    // Import and run CLI
    Promise.resolve().then(() => __importStar(require('./cli/index'))).then(({ QuantumFlowCLI }) => {
        const cli = new QuantumFlowCLI();
        return cli.run();
    }).catch((error) => {
        console.error('CLI Error:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map