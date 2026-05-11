import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; message: string; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  override render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 py-24 px-8 text-center"
        style={{ color: '#3a342e' }}
      >
        <div className="text-4xl">⚠</div>
        <h2
          className="text-[22px] font-medium"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Something went wrong
        </h2>
        <p className="text-[13px] font-mono max-w-sm" style={{ color: '#6e645a' }}>
          {this.state.message}
        </p>
        <button
          className="mt-2 text-[14px] underline"
          style={{ color: 'oklch(0.62 0.18 28)', fontFamily: "'Crimson Pro', serif" }}
          onClick={() => window.location.reload()}
        >
          Reload page
        </button>
      </div>
    );
  }
}
