import { useState, useEffect } from "react"
import LoadingScreen from "../components/LoadingScreen"

/**
 * AppInitializer - Shows loading screen on first load
 * Note: We use local OSM data for parking slots, so backend wake-up is just for authentication
 */
export default function AppInitializer({ children }) {
  const [isInitializing, setIsInitializing] = useState(true)
  const [message, setMessage] = useState("Loading...")

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if we've already initialized in this session
        const hasInitialized = sessionStorage.getItem("app_initialized")
        
        if (hasInitialized === "true") {
          // Already initialized, skip loading screen
          setIsInitializing(false)
          return
        }

        // First time loading - brief loading screen
        setMessage("Loading ParkEase...")
        
        // Quick 1 second delay for smooth UX, then proceed
        // We don't need to wait for backend - parking data is local
        setTimeout(() => {
          sessionStorage.setItem("app_initialized", "true")
          setIsInitializing(false)
        }, 800)
        
        // Silently ping backend to wake it up (for auth features later)
        // This runs in background without blocking the UI
        try {
          fetch(`${import.meta.env.VITE_API_URL || "https://parking-management-system-hs2i.onrender.com/api"}/health`, {
            method: 'GET',
            mode: 'cors',
          }).catch(() => {
            // Silently ignore - backend wake-up is not critical for initial load
            console.log("📡 Backend wake-up ping sent (response may take 30-60s)")
          })
        } catch {
          // Ignore errors
        }
        
      } catch (error) {
        console.error("Initialization error:", error)
        // Proceed anyway on error
        sessionStorage.setItem("app_initialized", "true")
        setIsInitializing(false)
      }
    }

    initializeApp()
  }, [])

  if (isInitializing) {
    return <LoadingScreen message={message} />
  }

  return children
}
