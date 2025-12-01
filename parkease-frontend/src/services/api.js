import axios from "axios"
import { toast } from "sonner"

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://parking-management-system-snowy.onrender.com/api"

// Log the API URL for debugging
console.log("🔗 API Base URL:", API_BASE_URL)

// Retry configuration
const MAX_RETRIES = 7 // Increased from 5 to give more time
const INITIAL_RETRY_DELAY = 8000 // 8 seconds (increased from 5)
let wakeUpToastId = null

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 90000, // 90 seconds (increased from 60) for Render wake-up
})

// Helper function to delay execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Helper function to check if error is due to backend sleeping
const isBackendSleepError = (error) => {
  if (
    !error.response &&
    (error.code === "ECONNABORTED" ||
      error.code === "ERR_NETWORK" ||
      error.message.includes("Network Error") ||
      error.message.includes("timeout"))
  ) {
    return true
  }
  return false
}

// Request interceptor - Add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log("🔐 Token added to request:", config.url, "Token preview:", token.substring(0, 20) + "...")
    } else {
      console.warn("⚠️ No token found for request:", config.url)
    }

    // Initialize retry count if not present
    if (!config.retryCount) {
      config.retryCount = 0
    }

    return config
  },
  (error) => {
    console.error("❌ Request interceptor error:", error)
    return Promise.reject(error)
  },
)

// Response interceptor - Handle errors and retry logic for backend wake-up
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Success:", response.config.url, "Status:", response.status)

    // Success! Dismiss wake-up toast if it exists
    if (wakeUpToastId) {
      toast.dismiss(wakeUpToastId)
      toast.success("✅ Connected! Loading data...", { duration: 2000 })
      wakeUpToastId = null
    }

    return response
  },
  async (error) => {
    const config = error.config

    if (error.response) {
      // Server responded with error status
      console.error("❌ API Error:", {
        url: error.config?.url,
        status: error.response.status,
        message: error.response.data?.message || error.message,
        hasToken: !!error.config?.headers?.Authorization,
      })

      if (error.response.status === 401) {
        console.log("🔒 Unauthorized - Clearing session and redirecting to login")
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/login"
      } else if (error.response.status === 403) {
        console.error("🚫 Forbidden - Token might be invalid or expired")
        console.log("Token in storage:", localStorage.getItem("token")?.substring(0, 50) + "...")
        toast.error("Access forbidden. Please check your permissions.")
      }

      return Promise.reject(error)
    }

    // Check if this is a backend sleep error and we haven't exceeded retry limit
    if (isBackendSleepError(error) && (!config.retryCount || config.retryCount < MAX_RETRIES)) {
      config.retryCount = (config.retryCount || 0) + 1

      // Show appropriate toast based on retry attempt
      if (config.retryCount === 1) {
        // First attempt - show wake-up message
        console.log("🚀 Backend appears to be sleeping, attempting wake-up...")
        wakeUpToastId = toast.loading("🚀 Waking up backend (free tier takes 60-90s)...", {
          duration: Infinity,
        })
      } else if (config.retryCount <= 3) {
        // Early attempts - encouraging message
        console.log(`⏳ Retry attempt ${config.retryCount}/${MAX_RETRIES}`)
        if (wakeUpToastId) {
          toast.dismiss(wakeUpToastId)
        }
        wakeUpToastId = toast.loading(`⏳ Still connecting... ${config.retryCount}/${MAX_RETRIES} (please wait)`, {
          duration: Infinity,
        })
      } else {
        // Later attempts - show countdown
        console.log(`⏳ Retry attempt ${config.retryCount}/${MAX_RETRIES}`)
        if (wakeUpToastId) {
          toast.dismiss(wakeUpToastId)
        }
        const remaining = MAX_RETRIES - config.retryCount
        wakeUpToastId = toast.loading(`⏳ Almost there... ${remaining} attempts left`, {
          duration: Infinity,
        })
      }

      // Calculate exponential backoff delay
      const retryDelay = INITIAL_RETRY_DELAY * Math.pow(1.5, config.retryCount - 1)
      console.log(`⏱️ Waiting ${retryDelay / 1000} seconds before retry...`)

      // Wait before retrying
      await delay(retryDelay)

      // Retry the request
      return api(config)
    }

    // If we've exhausted retries or it's a different error
    if (wakeUpToastId) {
      toast.dismiss(wakeUpToastId)
      wakeUpToastId = null
    }

    if (config.retryCount >= MAX_RETRIES) {
      console.error("❌ Max retries exceeded. Backend is taking too long to wake up.")
      toast.error(
        "⚠️ Backend is still starting. Please wait 60 seconds and refresh the page.",
        {
          duration: 10000,
          action: {
            label: "Refresh Now",
            onClick: () => window.location.reload(),
          },
        }
      )
    } else if (error.request) {
      console.error("❌ No response from server:", error.message)
      toast.error("Network error. Please check your connection.", { duration: 4000 })
    } else {
      console.error("❌ Error:", error.message)
    }

    return Promise.reject(error)
  },
)

export default api
