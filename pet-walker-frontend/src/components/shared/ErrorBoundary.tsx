"use client";
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Puedes enviar el error a un servicio externo aquí
    console.error('ErrorBoundary atrapó un error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
          <h1 className="text-2xl font-bold text-red-600 mb-4">¡Ha ocurrido un error inesperado!</h1>
          <p className="mb-4 text-gray-700">{this.state.error?.message}</p>
          <button
            onClick={this.handleReload}
            className="px-6 py-2 bg-primary text-white rounded shadow hover:bg-primary/80 transition"
          >
            Recargar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary; 