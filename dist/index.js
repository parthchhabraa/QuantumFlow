"use strict";
/**
 * QuantumFlow by eliomatters
 * Quantum-inspired compression algorithm
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProbabilityAnalyzer = exports.PatternRecognizer = exports.SuperpositionProcessor = exports.DataChunker = exports.QuantumPhaseAssigner = exports.QuantumStateConverter = exports.CompressedQuantumData = exports.QuantumConfig = exports.EntanglementPair = exports.SuperpositionState = exports.QuantumStateVector = exports.QuantumMath = exports.Complex = void 0;
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
// Main entry point for CLI usage
if (require.main === module) {
    console.log('QuantumFlow by eliomatters - Quantum Compression Simulator');
    console.log('Mathematical foundations initialized successfully!');
}
//# sourceMappingURL=index.js.map