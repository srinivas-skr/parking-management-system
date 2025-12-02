import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, useLocation } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { Toaster } from "sonner"
import ErrorBoundary from "./components/ErrorBoundary"
import App from "./App"
import "./index.css"

// Wrapper component to get location and pass as resetKey to ErrorBoundary
function AppWithErrorBoundary() {
  const location = useLocation()
  
  return (
    <ErrorBoundary resetKey={location.pathname + location.search}>
      <AuthProvider>
        <App />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </ErrorBoundary>
  )
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppWithErrorBoundary />
    </BrowserRouter>
  </React.StrictMode>,
)
