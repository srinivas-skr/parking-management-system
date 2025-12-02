

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import StatsCard from "../components/StatsCard"
import Skeleton from "../components/ui/skeleton"
import PageTransition from "../components/PageTransition"
import ParticleBackground from "../components/ParticleBackground"
import AnalyticsSection from "../components/AnalyticsSection"
import { Button } from "../components/ui/button"
import { toast } from "sonner"
import { Car, Bike, Clock, Calendar, DollarSign, RefreshCw, MapPin, ArrowRight, Sparkles } from "lucide-react"
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

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch only bookings for dashboard stats
      const bookingsResult = await api.get("/bookings").catch(() => ({ data: [] }))
      
      if (bookingsResult.data) {
        console.log("✅ Bookings loaded:", bookingsResult.data.length)
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
    // Navigate to Find Parking page with vehicle filter
    navigate(`/slots?vehicleType=${vehicleType}`)
  }

  const handleAreaSelect = (area) => {
    // Navigate to Find Parking page with area location
    navigate(`/slots?area=${encodeURIComponent(area.name)}&lat=${area.lat}&lng=${area.lng}`)
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
          {/* Hero Skeleton */}
          <div className="bg-gradient-to-r from-purple-400/20 to-purple-600/20 rounded-2xl p-8 backdrop-blur-sm">
            <Skeleton className="h-10 w-64 mb-4 bg-white/50" />
            <Skeleton className="h-6 w-48 bg-white/40" />
          </div>
          
          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-6"
              >
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-8 w-16" />
              </motion.div>
            ))}
          </div>
          
          {/* Vehicle Selection Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl bg-white/60" />
            ))}
          </div>
          
          {/* Areas Grid Skeleton */}
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

      <main className="relative z-10 container mx-auto px-4 py-8 space-y-8">
        {/* Enhanced Hero Section with gradient mesh */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-gradient-to-r from-purple-600 via-purple-500 to-purple-700 rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-2xl overflow-hidden"
        >
          {/* Mesh pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2"
              >
                Welcome back, {user?.fullName}! 👋
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-white/90 text-sm sm:text-base lg:text-lg"
              >
                Find and book your perfect parking spot in Bengaluru
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="w-full sm:w-auto"
            >
              <Button
                onClick={() => navigate("/slots")}
                variant="secondary"
                size="lg"
                className="gap-2 shadow-lg w-full sm:w-auto min-h-[44px]"
              >
                <MapPin className="h-4 w-4" />
                Find Parking Now
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          <StatsCard
            title="My Bookings"
            value={stats.myBookings}
            icon={Calendar}
            gradient="from-purple-500 to-pink-500"
            index={0}
          />
          <StatsCard
            title="Active Bookings"
            value={stats.activeBookings}
            icon={Clock}
            gradient="from-green-500 to-emerald-500"
            index={1}
          />
          <StatsCard
            title="Total Spent"
            value={stats.totalSpent}
            icon={DollarSign}
            gradient="from-orange-500 to-red-500"
            index={2}
            prefix="₹ "
            decimals={0}
          />
        </motion.div>

        {/* Vehicle Type Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">What are you parking?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Bike Option */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleVehicleSelect("TWO_WHEELER")}
              className={`cursor-pointer relative overflow-hidden rounded-2xl p-4 sm:p-6 border-2 transition-all duration-300 min-h-[100px]
                ${selectedVehicle === "TWO_WHEELER" 
                  ? "border-green-500 bg-gradient-to-br from-green-50 to-emerald-100 shadow-lg shadow-green-200" 
                  : "border-slate-200 bg-white hover:border-green-300 hover:shadow-lg"}`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg flex-shrink-0">
                  <Bike className="h-7 w-7 sm:h-10 sm:w-10 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-2xl font-bold text-slate-900">Bike / Scooter</h3>
                  <p className="text-slate-500 text-sm sm:text-base">Two-wheeler parking spots</p>
                  <p className="text-green-600 font-semibold mt-1 text-sm sm:text-base">Starting from ₹10/hr</p>
                </div>
                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400 flex-shrink-0" />
              </div>
              {/* Decorative element */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-green-200/30 rounded-full blur-2xl" />
            </motion.div>

            {/* Car Option */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleVehicleSelect("FOUR_WHEELER")}
              className={`cursor-pointer relative overflow-hidden rounded-2xl p-4 sm:p-6 border-2 transition-all duration-300 min-h-[100px]
                ${selectedVehicle === "FOUR_WHEELER" 
                  ? "border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-100 shadow-lg shadow-blue-200" 
                  : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg"}`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg flex-shrink-0">
                  <Car className="h-7 w-7 sm:h-10 sm:w-10 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-2xl font-bold text-slate-900">Car / SUV</h3>
                  <p className="text-slate-500 text-sm sm:text-base">Four-wheeler parking spots</p>
                  <p className="text-blue-600 font-semibold mt-1 text-sm sm:text-base">Starting from ₹20/hr</p>
                </div>
                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400 flex-shrink-0" />
              </div>
              {/* Decorative element */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-200/30 rounded-full blur-2xl" />
            </motion.div>
          </div>
        </motion.div>

        {/* Popular Areas Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Popular Areas in Bengaluru</h2>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate("/slots")}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 min-h-[44px]"
            >
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {popularAreas.map((area, index) => (
              <motion.div
                key={area.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAreaSelect(area)}
                className="cursor-pointer bg-white rounded-xl p-3 sm:p-4 border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 min-h-[80px]"
              >
                <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{area.icon}</div>
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">{area.name}</h3>
                <p className="text-xs sm:text-sm text-slate-500">{area.slots}+ spots</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4 sm:p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <Button
              onClick={() => navigate("/slots")}
              className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto min-h-[44px]"
            >
              <MapPin className="mr-2 h-4 w-4" />
              Explore All Parking
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/bookings")}
              className="border-purple-300 text-purple-700 hover:bg-purple-50 w-full sm:w-auto min-h-[44px]"
            >
              <Calendar className="mr-2 h-4 w-4" />
              My Bookings
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/vehicles")}
              className="border-purple-300 text-purple-700 hover:bg-purple-50 w-full sm:w-auto min-h-[44px]"
            >
              <Car className="mr-2 h-4 w-4" />
              Manage Vehicles
            </Button>
          </div>
        </motion.div>

        {/* Analytics Section */}
        <AnalyticsSection bookings={bookings} />
      </main>
    </PageTransition>
  )
}

export default Dashboard
