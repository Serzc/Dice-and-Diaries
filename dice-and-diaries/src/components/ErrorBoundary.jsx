import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "Error desconocido" };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main style={{ padding: "2rem", textAlign: "center" }}>
          <h2>Algo salió mal</h2>
          <p style={{ color: "#6b7280" }}>{this.state.message}</p>
          <button
            style={{ marginTop: "1rem", padding: "0.5rem 1.2rem", cursor: "pointer" }}
            onClick={() => window.location.reload()}
          >
            Recargar página
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}
