import React, { Component, ErrorInfo, ReactNode } from 'react';
interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}
interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}
export declare class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props);
    static getDerivedStateFromError(error: Error): State;
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    render(): string | number | boolean | import("react/jsx-runtime").JSX.Element | Iterable<React.ReactNode> | null | undefined;
}
export {};
//# sourceMappingURL=ErrorBoundary.d.ts.map