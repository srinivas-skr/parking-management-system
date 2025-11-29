import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import { useEffect } from "react"
import ProtectedRoute from "./routes/ProtectedRoute"
import LandingPage from "./pages/LandingPage"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Vehicles from "./pages/Vehicles"
import Bookings from "./pages/Bookings"
import BookSlot from "./pages/BookSlot"
import ParkingSlots from "./pages/ParkingSlots"
import Settings from "./pages/Settings"

// Page titles mapping
const pageTitles = {
  "/": "ParkEase - Smart Parking Management",
  "/login": "ParkEase - Login",
  "/register": "ParkEase - Register",
  "/dashboard": "ParkEase - Dashboard",
  "/vehicles": "ParkEase - My Vehicles",
  "/bookings": "ParkEase - My Bookings",
  "/slots": "ParkEase - Find Parking",
  "/settings": "ParkEase - Settings"
}

function App() {
  const location = useLocation()
  
  // Update page title based on route
  useEffect(() => {
    const path = location.pathname
    const title = path.startsWith("/book/") 
      ? "ParkEase - Book Slot" 
      : pageTitles[path] || "ParkEase"
    document.title = title
  }, [location])
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vehicles"
          element={
            <ProtectedRoute>
              <Vehicles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <Bookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book/:slotId"
          element={
            <ProtectedRoute>
              <BookSlot />
            </ProtectedRoute>
          }
        />
        <Route
          path="/slots"
          element={
            <ProtectedRoute>
              <ParkingSlots />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  )
}

export default App
