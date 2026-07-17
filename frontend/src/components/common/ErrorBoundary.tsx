import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallbackLabel?: string;
}

interface State {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: error instanceof Error ? error.message : String(error) };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error(`[ErrorBoundary:${this.props.fallbackLabel ?? "section"}]`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
          <p className="font-medium">
            {this.props.fallbackLabel ?? "This section"} failed to load.
          </p>
          <p className="text-red-300/60 text-xs mt-1 break-all">{this.state.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}