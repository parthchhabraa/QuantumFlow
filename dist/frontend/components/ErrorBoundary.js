"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorBoundary = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
class ErrorBoundary extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }
    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return ((0, jsx_runtime_1.jsxs)("div", { className: "error-boundary", children: [(0, jsx_runtime_1.jsxs)("div", { className: "error-content", children: [(0, jsx_runtime_1.jsx)("div", { className: "error-icon", children: "\u26A0\uFE0F" }), (0, jsx_runtime_1.jsx)("h2", { className: "error-title", children: "Something went wrong" }), (0, jsx_runtime_1.jsx)("p", { className: "error-message", children: "An unexpected error occurred. Please refresh the page to try again." }), (0, jsx_runtime_1.jsx)("button", { className: "error-button", onClick: () => window.location.reload(), children: "Refresh Page" }), process.env.NODE_ENV === 'development' && this.state.error && ((0, jsx_runtime_1.jsxs)("details", { className: "error-details", children: [(0, jsx_runtime_1.jsx)("summary", { children: "Error Details (Development)" }), (0, jsx_runtime_1.jsxs)("pre", { className: "error-stack", children: [this.state.error.toString(), this.state.errorInfo?.componentStack] })] }))] }), (0, jsx_runtime_1.jsx)("style", { children: `
            .error-boundary {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 200px;
              padding: 2rem;
              background: rgba(239, 68, 68, 0.1);
              border: 1px solid rgba(239, 68, 68, 0.2);
              border-radius: 12px;
              margin: 1rem 0;
            }

            .error-content {
              text-align: center;
              max-width: 500px;
            }

            .error-icon {
              font-size: 3rem;
              margin-bottom: 1rem;
            }

            .error-title {
              font-size: 1.5rem;
              font-weight: 700;
              color: #ffffff;
              margin-bottom: 0.5rem;
            }

            .error-message {
              font-size: 1rem;
              color: #a1a1aa;
              margin-bottom: 1.5rem;
              line-height: 1.5;
            }

            .error-button {
              background: linear-gradient(135deg, #ef4444, #dc2626);
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s ease;
            }

            .error-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
            }

            .error-details {
              margin-top: 1.5rem;
              text-align: left;
              background: rgba(0, 0, 0, 0.2);
              border-radius: 8px;
              padding: 1rem;
            }

            .error-details summary {
              color: #a1a1aa;
              cursor: pointer;
              font-weight: 600;
              margin-bottom: 0.5rem;
            }

            .error-stack {
              color: #71717a;
              font-size: 0.8rem;
              white-space: pre-wrap;
              overflow-x: auto;
              margin: 0;
            }
          ` })] }));
        }
        return this.props.children;
    }
}
exports.ErrorBoundary = ErrorBoundary;
//# sourceMappingURL=ErrorBoundary.js.map