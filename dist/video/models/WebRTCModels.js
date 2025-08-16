"use strict";
/**
 * WebRTC models for video conferencing infrastructure
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebRTCError = void 0;
/**
 * WebRTC error class
 */
class WebRTCError extends Error {
    constructor(errorData) {
        super(errorData.message);
        this.name = 'WebRTCError';
        this.type = errorData.type;
        this.code = errorData.code;
        this.participantId = errorData.participantId;
        this.roomId = errorData.roomId;
        this.timestamp = errorData.timestamp;
        this.details = errorData.details;
    }
}
exports.WebRTCError = WebRTCError;
//# sourceMappingURL=WebRTCModels.js.map