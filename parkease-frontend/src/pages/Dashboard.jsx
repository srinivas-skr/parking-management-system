import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import Skeleton from "../components/ui/skeleton"
import PageTransition from "../components/PageTransition"
import ParticleBackground from "../components/ParticleBackground"
import { toast } from "sonner"
import { Car, Bike, Clock, Calendar, DollarSign, ChevronDown, Search, MapPin, Navigation, Loader2 } from "lucide-react"
import api from "../services/api"

// Popular areas in Bengaluru with coordinates
const popularAreas = [
  { name: "Koramangala", lat: 12.9352, lng: 77.6245, icon: "🏢", slots: 45 },
  { name: "Indiranagar", lat: 12.9719, lng: 77.6412, icon: "🎯", slots: 38 },
  { name: "Whitefield", lat: 12.9771, lng: 77.7265, icon: "💼", slots: 52 },
  { name: "MG Road", lat: 12.9756, lng: 77.6066, icon: "🛍️", slots: 28 },
  { name: "HSR Layout", lat: 12.9082, lng: 77.6476, icon: "🏠", slots: 35 },
  { name: "Electronic City", lat: 12.8426, lng: 77.6598, icon: "🏭", slots: 60 },
  { name: "Jayanagar", lat: 12.9250, lng: 77.5838, icon: "🌳", slots: 22 },
  { name: "Malleshwaram", lat: 13.0096, lng: 77.5679, icon: "🏛️", slots: 18 },
]

function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [vehicles, setVehicles] = useState([]) // User's vehicles
  const [loading, setLoading] = useState(true)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [selectedArea, setSelectedArea] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  // NEW: Step-based flow
  const [currentStep, setCurrentStep] = useState(1) // 1=vehicle type, 2=vehicle details, 3=location
  const [vehicleNumber, setVehicleNumber] = useState("")
  const [vehicleBrand, setVehicleBrand] = useState("")
  const [addingVehicle, setAddingVehicle] = useState(false)
  const [showAddNew, setShowAddNew] = useState(false) // Toggle between list and add new form
  const [selectedExistingVehicle, setSelectedExistingVehicle] = useState(null) // Selected from existing list

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch bookings
      const bookingsResult = await api.get("/bookings").catch(() => ({ data: [] }))
      if (bookingsResult.data) {
        setBookings(Array.isArray(bookingsResult.data) ? bookingsResult.data : [])
      }
      
      // Fetch user's vehicles
      const vehiclesResult = await api.get("/vehicles").catch(() => ({ data: [] }))
      if (vehiclesResult.data) {
        setVehicles(Array.isArray(vehiclesResult.data) ? vehiclesResult.data : [])
      }
    } catch (error) {
      console.error("❌ Failed to fetch data:", error)
      setBookings([])
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }
  
  // Get available vehicles (not currently parked) filtered by vehicle type
  const getAvailableVehicles = () => {
    // Get vehicle numbers that are currently in active bookings
    const parkedVehicleNumbers = bookings
      .filter(b => b.status === "ACTIVE" || b.status === "CONFIRMED" || b.status === "active" || b.status === "confirmed")
      .map(b => b.vehicleNumber?.toUpperCase())
      .filter(Boolean)
    
    // Filter user's vehicles: match type AND not currently parked
    return vehicles.filter(v => {
      const vehicleType = v.vehicleType?.toUpperCase()
      const matchesType = selectedVehicle === "TWO_WHEELER" 
        ? (vehicleType === "TWO_WHEELER" || vehicleType === "BIKE" || vehicleType === "SCOOTER")
        : (vehicleType === "FOUR_WHEELER" || vehicleType === "CAR" || vehicleType === "SUV")
      const isNotParked = !parkedVehicleNumbers.includes(v.vehicleNumber?.toUpperCase())
      return matchesType && isNotParked
    })
  }

  const handleVehicleSelect = (vehicleType) => {
    setSelectedVehicle(vehicleType)
    setCurrentStep(2) // Move to vehicle details step
    setShowAddNew(false) // Reset to show existing vehicles first
    setSelectedExistingVehicle(null)
    setVehicleNumber("")
    setVehicleBrand("")
    toast.success(`${vehicleType === "TWO_WHEELER" ? "Bike" : "Car"} selected!`)
  }
  
  // Select existing vehicle and go directly to Find Parking
  const handleSelectExistingVehicle = (vehicle) => {
    setSelectedExistingVehicle(vehicle)
    setVehicleNumber(vehicle.vehicleNumber)
    setVehicleBrand(vehicle.brand || "")
    toast.success(`Selected ${vehicle.vehicleNumber}`)
    
    // Go directly to Find Parking page with vehicle info
    navigate(`/slots?vehicleType=${selectedVehicle}&vehicleNumber=${encodeURIComponent(vehicle.vehicleNumber)}`)
  }
  
  // NEW: Add vehicle and move to location selection
  const handleAddVehicle = async () => {
    if (!vehicleNumber.trim()) {
      toast.error("Please enter your vehicle number")
      return
    }
    
    setAddingVehicle(true)
    
    try {
      // Try to add vehicle to backend
      await api.post("/vehicles", {
        vehicleNumber: vehicleNumber.toUpperCase(),
        vehicleType: selectedVehicle,
        brand: vehicleBrand || (selectedVehicle === "TWO_WHEELER" ? "Bike" : "Car")
      })
      toast.success("Vehicle added successfully!")
      // Refresh vehicles list
      const vehiclesResult = await api.get("/vehicles").catch(() => ({ data: [] }))
      if (vehiclesResult.data) {
        setVehicles(Array.isArray(vehiclesResult.data) ? vehiclesResult.data : [])
      }
    } catch (error) {
      // Even if backend fails, continue (for demo mode)
      console.log("Backend vehicle add failed, continuing in demo mode")
    }
    
    setAddingVehicle(false)
    
    // Go directly to Find Parking page with vehicle info
    navigate(`/slots?vehicleType=${selectedVehicle}&vehicleNumber=${encodeURIComponent(vehicleNumber.toUpperCase())}`)
  }

  const handleAreaSelect = (area) => {
    setSelectedArea(area)
    // Navigate with both vehicle and area
    navigate(`/slots?vehicleType=${selectedVehicle}&area=${encodeURIComponent(area.name)}&lat=${area.lat}&lng=${area.lng}`)
  }

  // GPS Auto-detect location - WITH IMPROVED ERROR HANDLING
  const detectLocation = () => {
    // ENFORCE: Must complete vehicle steps first
    if (currentStep < 3) {
      toast.error("⚠️ Please complete vehicle details first!")
      return
    }
    
    setLocationLoading(true)
    
    if (!navigator.geolocation) {
      setLocationLoading(false)
      toast.error("Geolocation is not supported by your browser.")
      return
    }
    
    console.log('🔍 Requesting location...')
    
    // ✅ Improved options - use network location first (faster)
    const options = {
      enableHighAccuracy: false,  // ✅ Faster - uses network/WiFi location
      timeout: 15000,             // ✅ 15 second timeout
      maximumAge: 60000           // ✅ Accept 1-minute-old cached location
    }
    
    navigator.geolocation.getCurrentPosition(
      // SUCCESS
      (position) => {
        console.log('✅ Location obtained:', position.coords)
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        setLocationLoading(false)
        toast.success("Location detected! Redirecting to nearby parking...")
        
        // Redirect to parking slots page with location AND vehicle type
        navigate(`/slots?lat=${latitude}&lng=${longitude}&vehicleType=${selectedVehicle}`)
      },
      // ERROR
      (error) => {
        console.error('❌ Geolocation error:', error)
        setLocationLoading(false)
        
        let errorMsg = ''
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Location permission denied. Please enable in browser settings.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Location unavailable. Check GPS/network connection.'
            break
          case error.TIMEOUT:
            errorMsg = 'Location request timed out. Please try again or search manually.'
            break
          default:
            errorMsg = 'Failed to get location. Please search manually.'
        }
        
        toast.error(errorMsg, {
          description: "💡 Tip: Use the search box or select an area instead",
          duration: 5000
        })
      },
      options
    )
  }

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e?.preventDefault()
    
    // ENFORCE: Must complete vehicle steps first
    if (currentStep < 3) {
      toast.error("⚠️ Please complete vehicle details first!")
      return
    }
    
    if (searchQuery.trim()) {
      // Find matching area
      const matchingArea = popularAreas.find(a => 
        a.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      if (matchingArea) {
        handleAreaSelect(matchingArea)
      } else {
        // Navigate with search query AND vehicle type
        navigate(`/slots?search=${encodeURIComponent(searchQuery)}&vehicleType=${selectedVehicle}`)
      }
    } else {
      navigate(`/slots?vehicleType=${selectedVehicle}`)
    }
  }

  const handleFindParking = () => {
    // ENFORCE: Must complete vehicle steps first
    if (currentStep < 3) {
      toast.error("⚠️ Please complete vehicle details first!")
      return
    }
    
    let url = "/slots"
    const params = [`vehicleType=${selectedVehicle}`]
    if (selectedArea) {
      params.push(`area=${encodeURIComponent(selectedArea.name)}`)
      params.push(`lat=${selectedArea.lat}`)
      params.push(`lng=${selectedArea.lng}`)
    }
    url += `?${params.join("&")}`
    navigate(url)
  }

  const stats = {
    myBookings: bookings.length,
    activeBookings: bookings.filter((b) => b.status === "ACTIVE" || b.status === "CONFIRMED").length,
    totalSpent: bookings.reduce((sum, b) => sum + (b.totalCost || 0), 0),
  }

  if (loading) {
    return (
      <PageTransition className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-100">
        <ParticleBackground />
        <Navbar />
        <main className="relative z-10 container mx-auto px-4 py-8 space-y-8">
          <div className="bg-gradient-to-r from-purple-400/20 to-purple-600/20 rounded-2xl p-8 backdrop-blur-sm">
            <Skeleton className="h-10 w-64 mb-4 bg-white/50" />
            <Skeleton className="h-6 w-48 bg-white/40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl bg-white/60" />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl bg-white/60" />
            ))}
          </div>
        </main>
      </PageTransition>
    )
  }

  return (
    <PageTransition className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-100">
      <ParticleBackground />
      <Navbar />

      <main className="relative z-10 container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* ═══════════════════════════════════════════════════════
            SECTION 1: HERO BANNER
        ═══════════════════════════════════════════════════════ */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-gradient-to-r from-purple-600 via-purple-500 to-purple-700 rounded-2xl p-6 sm:p-8 text-white shadow-2xl overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
          
          <div className="relative z-10 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2"
            >
              Welcome back, {user?.fullName || "User"}! 👋
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/90 text-base sm:text-lg"
            >
              Find and book your perfect parking spot in Bengaluru
            </motion.p>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════
            SECTION 2: QUICK STATS (MOVED TO TOP)
        ═══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-3 gap-3 sm:gap-4"
        >
          <motion.div 
            whileHover={{ y: -2 }}
            onClick={() => navigate("/bookings")}
            className="cursor-pointer bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-slate-500">My Bookings</p>
                <p className="text-2xl sm:text-4xl font-bold text-slate-900 mt-1">{stats.myBookings}</p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 sm:h-7 sm:w-7 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -2 }}
            onClick={() => navigate("/bookings")}
            className="cursor-pointer bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-slate-500">Active</p>
                <p className="text-2xl sm:text-4xl font-bold text-slate-900 mt-1">{stats.activeBookings}</p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 sm:h-7 sm:w-7 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-slate-500">Spent</p>
                <p className="text-2xl sm:text-4xl font-bold text-slate-900 mt-1">₹{stats.totalSpent}</p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 sm:h-7 sm:w-7 text-orange-600" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════
            SECTION 3: LOCATION SEARCH - HIDDEN (User selects vehicle first, then area)
        ═══════════════════════════════════════════════════════ */}
        {/* Search section removed - users now select vehicle type first, then choose area */}

        {/* ═══════════════════════════════════════════════════════
            SECTION 4: STEP 1 - CHOOSE YOUR VEHICLE
        ═══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-100"
        >
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-5 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
              1
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Choose Your Vehicle</h2>
              <p className="text-slate-500 text-sm sm:text-base">Select what you're parking today</p>
            </div>
          </div>

          {/* Vehicle Cards - BIG and Prominent */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Bike Card */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleVehicleSelect("TWO_WHEELER")}
              className={`group relative border-4 rounded-2xl p-6 sm:p-8 transition-all duration-300 text-left
                ${selectedVehicle === "TWO_WHEELER" 
                  ? "border-green-500 bg-gradient-to-br from-green-50 to-emerald-100 shadow-xl shadow-green-200/50" 
                  : "border-transparent bg-gradient-to-br from-green-50 to-green-100 hover:border-green-400 hover:shadow-lg"}`}
            >
              {/* Badge */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-8 h-8 sm:w-10 sm:h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base shadow-md">
                1A
              </div>
              
              {/* Selected Checkmark */}
              {selectedVehicle === "TWO_WHEELER" && (
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                  ✓
                </div>
              )}

              <div className="flex flex-col items-center gap-3 sm:gap-4 pt-4 sm:pt-6">
                <div className="text-5xl sm:text-7xl">🏍️</div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Bike / Scooter</h3>
                <p className="text-slate-600 text-sm sm:text-lg text-center">Two-wheeler parking spots</p>
                <span className="text-lg sm:text-xl font-semibold text-green-600">Starting from ₹10/hr</span>
                <div className={`mt-2 sm:mt-4 px-5 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-all
                  ${selectedVehicle === "TWO_WHEELER" 
                    ? "bg-green-500 text-white" 
                    : "bg-purple-600 text-white group-hover:scale-105"}`}>
                  {selectedVehicle === "TWO_WHEELER" ? "✓ Selected" : "Select Bike →"}
                </div>
              </div>
            </motion.button>

            {/* Car Card */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleVehicleSelect("FOUR_WHEELER")}
              className={`group relative border-4 rounded-2xl p-6 sm:p-8 transition-all duration-300 text-left
                ${selectedVehicle === "FOUR_WHEELER" 
                  ? "border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-100 shadow-xl shadow-blue-200/50" 
                  : "border-transparent bg-gradient-to-br from-blue-50 to-blue-100 hover:border-blue-400 hover:shadow-lg"}`}
            >
              {/* Badge */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-8 h-8 sm:w-10 sm:h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base shadow-md">
                1B
              </div>
              
              {/* Selected Checkmark */}
              {selectedVehicle === "FOUR_WHEELER" && (
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                  ✓
                </div>
              )}

              <div className="flex flex-col items-center gap-3 sm:gap-4 pt-4 sm:pt-6">
                <div className="text-5xl sm:text-7xl">🚗</div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Car / SUV</h3>
                <p className="text-slate-600 text-sm sm:text-lg text-center">Four-wheeler parking spots</p>
                <span className="text-lg sm:text-xl font-semibold text-blue-600">Starting from ₹20/hr</span>
                <div className={`mt-2 sm:mt-4 px-5 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-all
                  ${selectedVehicle === "FOUR_WHEELER" 
                    ? "bg-blue-500 text-white" 
                    : "bg-purple-600 text-white group-hover:scale-105"}`}>
                  {selectedVehicle === "FOUR_WHEELER" ? "✓ Selected" : "Select Car →"}
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════
            POPUP MODAL: SELECT OR ADD VEHICLE (Appears after vehicle type selection)
        ═══════════════════════════════════════════════════════ */}
        {selectedVehicle && currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => {
              // Close if clicking backdrop
              if (e.target === e.currentTarget) {
                setCurrentStep(1)
                setSelectedVehicle(null)
                setShowAddNew(false)
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-md mx-auto relative max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setCurrentStep(1)
                  setSelectedVehicle(null)
                  setShowAddNew(false)
                }}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
              >
                ✕
              </button>

              {/* Modal Header */}
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">
                  {selectedVehicle === "TWO_WHEELER" ? "🏍️" : "🚗"}
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {showAddNew ? "Add New Vehicle" : "Select Vehicle"}
                </h2>
                <p className="text-slate-500 mt-1">
                  {showAddNew 
                    ? `Add your ${selectedVehicle === "TWO_WHEELER" ? "Bike/Scooter" : "Car/SUV"} info`
                    : `Choose your ${selectedVehicle === "TWO_WHEELER" ? "Bike/Scooter" : "Car/SUV"}`
                  }
                </p>
              </div>

              {/* ═══ EXISTING VEHICLES LIST ═══ */}
              {!showAddNew && (
                <div className="space-y-3">
                  {getAvailableVehicles().length > 0 ? (
                    <>
                      <p className="text-sm font-medium text-slate-600 mb-3">Your available vehicles:</p>
                      {getAvailableVehicles().map((vehicle, index) => (
                        <motion.button
                          key={vehicle.id || index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleSelectExistingVehicle(vehicle)}
                          className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-purple-50 hover:to-indigo-50 border-2 border-slate-200 hover:border-purple-400 rounded-xl transition-all group"
                        >
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
                            {selectedVehicle === "TWO_WHEELER" ? "🏍️" : "🚗"}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-bold text-slate-900 text-lg">{vehicle.vehicleNumber}</p>
                            <p className="text-sm text-slate-500">{vehicle.brand || (selectedVehicle === "TWO_WHEELER" ? "Two Wheeler" : "Four Wheeler")}</p>
                          </div>
                          <div className="text-purple-600 font-semibold group-hover:translate-x-1 transition-transform">
                            Select →
                          </div>
                        </motion.button>
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-6 bg-slate-50 rounded-xl">
                      <div className="text-4xl mb-3">📭</div>
                      <p className="text-slate-600 font-medium">No available {selectedVehicle === "TWO_WHEELER" ? "bikes" : "cars"}</p>
                      <p className="text-sm text-slate-400 mt-1">All vehicles are currently parked or none added yet</p>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-3 bg-white text-slate-500">or</span>
                    </div>
                  </div>

                  {/* Add New Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddNew(true)}
                    className="w-full h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">+</span> Add New Vehicle
                  </motion.button>
                </div>
              )}

              {/* ═══ ADD NEW VEHICLE FORM ═══ */}
              {showAddNew && (
                <div className="space-y-4">
                  {/* Back button */}
                  {getAvailableVehicles().length > 0 && (
                    <button
                      onClick={() => setShowAddNew(false)}
                      className="flex items-center gap-2 text-slate-500 hover:text-purple-600 transition-colors mb-2"
                    >
                      <span>←</span> Back to vehicle list
                    </button>
                  )}

                  {/* Vehicle Number */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Vehicle Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                      placeholder="e.g., KA-01-AB-1234"
                      autoFocus
                      className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none text-base font-medium uppercase transition-colors"
                    />
                  </div>

                  {/* Vehicle Brand/Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Brand / Model (Optional)
                    </label>
                    <input
                      type="text"
                      value={vehicleBrand}
                      onChange={(e) => setVehicleBrand(e.target.value)}
                      placeholder={selectedVehicle === "TWO_WHEELER" ? "e.g., Honda Activa" : "e.g., Maruti Swift"}
                      className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none text-base transition-colors"
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddVehicle}
                    disabled={addingVehicle || !vehicleNumber.trim()}
                    className="w-full h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {addingVehicle ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>Continue to Select Location →</>
                    )}
                  </motion.button>

                  <p className="text-center text-xs text-slate-400">
                    Vehicle will be saved to "My Vehicles"
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* REMOVED: Area selection step - now goes directly to Find Parking page with map search */}

        {/* Bottom Spacer for Mobile Nav */}
        <div className="h-20 md:h-0" />
      </main>
    </PageTransition>
  )
}

export default Dashboard
