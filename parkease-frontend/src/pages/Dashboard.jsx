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
  const [loading, setLoading] = useState(true)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [selectedArea, setSelectedArea] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const bookingsResult = await api.get("/bookings").catch(() => ({ data: [] }))
      if (bookingsResult.data) {
        setBookings(Array.isArray(bookingsResult.data) ? bookingsResult.data : [])
      }
    } catch (error) {
      console.error("❌ Failed to fetch data:", error)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const handleVehicleSelect = (vehicleType) => {
    setSelectedVehicle(vehicleType)
    toast.success(`${vehicleType === "TWO_WHEELER" ? "Bike" : "Car"} selected! Now choose your area below.`)
    
    // Auto-scroll to area selection section
    setTimeout(() => {
      const areaSection = document.getElementById('area-selection-section')
      if (areaSection) {
        areaSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 300)
  }

  const handleAreaSelect = (area) => {
    // ENFORCE: Vehicle type must be selected first
    if (!selectedVehicle) {
      toast.error("⚠️ Please select your vehicle type first!", {
        description: "This helps us show only compatible parking slots"
      })
      return
    }
    
    setSelectedArea(area)
    // Navigate with both vehicle and area
    navigate(`/slots?vehicleType=${selectedVehicle}&area=${encodeURIComponent(area.name)}&lat=${area.lat}&lng=${area.lng}`)
  }

  // GPS Auto-detect location - WITH IMPROVED ERROR HANDLING
  const detectLocation = () => {
    // ENFORCE: Vehicle type must be selected first
    if (!selectedVehicle) {
      toast.error("⚠️ Please select your vehicle type first!", {
        description: "Select Bike or Car before searching for parking"
      })
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
    
    // ENFORCE: Vehicle type must be selected first
    if (!selectedVehicle) {
      toast.error("⚠️ Please select your vehicle type first!", {
        description: "Select Bike or Car before searching for parking"
      })
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
    // ENFORCE: Vehicle type must be selected first
    if (!selectedVehicle) {
      toast.error("⚠️ Please select your vehicle type first!", {
        description: "Select Bike or Car to see compatible parking spots"
      })
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
            SECTION 3: LOCATION SEARCH (NEW)
        ═══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="h-7 w-7 sm:h-8 sm:w-8 text-purple-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Find Parking Near You</h2>
          </div>
          
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search location (e.g., Koramangala, MG Road)..."
                className="w-full h-12 sm:h-14 pl-12 pr-4 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none text-base sm:text-lg transition-colors"
              />
            </div>
            
            {/* Use My Location Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={detectLocation}
              disabled={locationLoading}
              className="h-12 sm:h-14 px-5 sm:px-8 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 sm:gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {locationLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="hidden sm:inline">Detecting...</span>
                </>
              ) : (
                <>
                  <Navigation className="h-5 w-5" />
                  <span className="hidden sm:inline">Use My Location</span>
                  <span className="sm:hidden">GPS</span>
                </>
              )}
            </motion.button>
            
            {/* Search Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-12 sm:h-14 px-6 sm:px-8 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 sm:gap-3 transition-all"
            >
              <Search className="h-5 w-5" />
              <span>Search</span>
            </motion.button>
          </form>
          
          {/* Location Status */}
          {userLocation && userLocation.lat != null && userLocation.lng != null && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-sm text-green-600 flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg"
            >
              <span>✅</span>
              <span>Location detected: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
            </motion.div>
          )}
        </motion.div>

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
            SECTION 5: STEP 2 - CHOOSE YOUR AREA
        ═══════════════════════════════════════════════════════ */}
        <motion.div
          id="area-selection-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-100"
        >
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-5 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
              2
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Choose Your Area</h2>
              <p className="text-slate-500 text-sm sm:text-base">Where do you need parking?</p>
            </div>
          </div>

          {/* Area Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {popularAreas.map((area, index) => (
              <motion.button
                key={area.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAreaSelect(area)}
                className={`relative border-2 rounded-xl p-4 sm:p-5 transition-all duration-300 text-left
                  ${selectedArea?.name === area.name 
                    ? "border-purple-500 bg-purple-50 shadow-lg" 
                    : "border-slate-200 bg-white hover:border-purple-400 hover:shadow-md"}`}
              >
                {/* Number Badge */}
                <div className="absolute top-2 right-2 w-6 h-6 sm:w-7 sm:h-7 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm">
                  {index + 1}
                </div>
                
                <div className="text-3xl sm:text-4xl mb-2">{area.icon}</div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">{area.name}</h3>
                <p className="text-xs sm:text-sm text-slate-500">{area.slots}+ spots</p>
              </motion.button>
            ))}
          </div>

          {/* BIG Search Button */}
          <div className="mt-6 sm:mt-8 text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFindParking}
              className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-full text-lg sm:text-xl font-bold shadow-xl hover:shadow-2xl transition-all inline-flex items-center gap-2"
            >
              <Search className="h-5 w-5 sm:h-6 sm:w-6" />
              Find Parking Now
            </motion.button>
            {selectedVehicle && (
              <p className="mt-3 text-sm text-slate-500">
                Searching for <span className="font-semibold text-purple-600">{selectedVehicle === "TWO_WHEELER" ? "Bike" : "Car"}</span> parking
                {selectedArea && <> near <span className="font-semibold text-purple-600">{selectedArea.name}</span></>}
              </p>
            )}
          </div>
        </motion.div>

        {/* Bottom Spacer for Mobile Nav */}
        <div className="h-20 md:h-0" />
      </main>
    </PageTransition>
  )
}

export default Dashboard
