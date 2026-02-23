"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("ErrorBoundary caught:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex-1 flex items-center justify-center p-10">
                    <div className="max-w-md w-full text-center flex flex-col items-center gap-8 animate-in fade-in duration-700">
                        <div className="w-20 h-20 rounded-[2rem] bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <AlertTriangle size={36} strokeWidth={1.5} className="text-red-400" />
                        </div>

                        <div className="flex flex-col gap-3">
                            <h2 className="text-[22px] font-semibold text-foreground tracking-tight">
                                Something went wrong
                            </h2>
                            <p className="text-[15px] text-muted-foreground leading-relaxed">
                                An unexpected error occurred. Please try again or refresh the page.
                            </p>
                            {this.state.error && (
                                <p className="text-[12px] font-mono text-muted-foreground/50 bg-secondary rounded-2xl px-4 py-3 mt-2 break-all">
                                    {this.state.error.message}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={this.handleReset}
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-2xl font-semibold text-[15px] hover:bg-primary/90 transition-all active:scale-[0.98] shadow-xl shadow-primary/20"
                        >
                            <RefreshCcw size={16} />
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
