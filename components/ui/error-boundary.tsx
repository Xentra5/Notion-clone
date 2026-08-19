"use client";

import React, { Component, type ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="my-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-foreground flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-semibold text-red-500 dark:text-red-400">
              {this.props.fallbackTitle || "Something went wrong in this section"}
            </p>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              {this.state.error?.message ||
                this.props.fallbackMessage ||
                "An unexpected rendering error occurred. You can reload this component."}
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-foreground/5 hover:bg-foreground/10 text-foreground text-[11px] font-medium transition cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
