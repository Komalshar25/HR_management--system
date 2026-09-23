import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught in boundary:', error, errorInfo);
    // You can also send to Sentry / LogRocket / your backend here
  }

  render() {
    if (this.state.hasError) {
      // You can make this nicer (styled component, retry button, etc.)
      return (
        <div style={{ padding: '2rem', color: '#721c24' }}>
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message || 'Unknown error'}</p>
          <button onClick={() => window.location.reload()}>
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;