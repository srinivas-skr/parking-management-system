import { useState, useEffect } from "react"
import LoadingScreen from "../components/LoadingScreen"
import api from "../services/api"

/**
 * AppInitializer - Shows loading screen on first load while backend wakes up
 * Only shows on initial app load, not on subsequent navigations
 */
export default function AppInitializer({ children }) {
  const [isInitializing, setIsInitializing] = useState(true)
  const [message, setMessage] = useState("Waking up servers...")

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

        // First time loading - check backend status
        setMessage("Connecting to servers...")
        
        // Try to ping backend (with timeout)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)
        
        try {
          await api.get("/slots", { 
            signal: controller.signal,
            params: { limit: 1 } // Minimal data
          })
          clearTimeout(timeoutId)
          
          // Backend is awake!
          setMessage("Ready! Loading app...")
          setTimeout(() => {
            sessionStorage.setItem("app_initialized", "true")
            setIsInitializing(false)
          }, 500)
        } catch (error) {
          clearTimeout(timeoutId)
          
          if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
            // Backend is sleeping, show longer loading
            setMessage("Servers are waking up (30-60s)...")
            
            // Keep trying with exponential backoff
            let attempts = 0
            const maxAttempts = 12 // 12 * 5s = 60s max
            
            const retry = async () => {
              attempts++
              
              if (attempts >= maxAttempts) {
                setMessage("Taking longer than expected...")
              } else if (attempts > 6) {
                setMessage(`Almost ready... (${attempts * 5}s)`)
              }
              
              try {
                await api.get("/slots", { params: { limit: 1 } })
                
                // Success!
                setMessage("Connected! Loading app...")
                setTimeout(() => {
                  sessionStorage.setItem("app_initialized", "true")
                  setIsInitializing(false)
                }, 500)
              } catch (retryError) {
                if (attempts < maxAttempts) {
                  setTimeout(retry, 5000) // Retry every 5 seconds
                } else {
                  // Give up and show app anyway
                  setMessage("Loading app (servers may be slow)...")
                  setTimeout(() => {
                    sessionStorage.setItem("app_initialized", "true")
                    setIsInitializing(false)
                  }, 1000)
                }
              }
            }
            
            setTimeout(retry, 5000) // First retry after 5s
          } else {
            // Other error, proceed anyway
            sessionStorage.setItem("app_initialized", "true")
            setIsInitializing(false)
          }
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
