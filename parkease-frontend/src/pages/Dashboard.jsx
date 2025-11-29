

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import StatsCard from "../components/StatsCard"
import SlotCard from "../components/SlotCard"
import EmptyState from "../components/EmptyState"
import Skeleton from "../components/ui/skeleton"
import PageTransition from "../components/PageTransition"
import ParticleBackground from "../components/ParticleBackground"
import AnalyticsSection from "../components/AnalyticsSection"
import MapView from "../components/MapView"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { toast } from "sonner"
import { Search, Grid, List, Car, Clock, Calendar, DollarSign, RefreshCw } from "lucide-react"
import api from "../services/api"

function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [slots, setSlots] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("ALL")
  const [filterStatus, setFilterStatus] = useState("ALL")
  const [viewMode, setViewMode] = useState("grid")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch slots and bookings separately to handle partial failures
      const [slotsResult, bookingsResult] = await Promise.allSettled([
        api.get("/slots"), 
        api.get("/bookings")
      ])
      
      // Handle slots result
      if (slotsResult.status === 'fulfilled') {
        console.log("✅ Slots loaded:", slotsResult.value.data.length)
        setSlots(Array.isArray(slotsResult.value.data) ? slotsResult.value.data : [])
      } else {
        console.error("❌ Failed to load slots:", slotsResult.reason)
        setSlots([])
      }
      
      // Handle bookings result
      if (bookingsResult.status === 'fulfilled') {
        console.log("✅ Bookings loaded:", bookingsResult.value.data.length)
        setBookings(Array.isArray(bookingsResult.value.data) ? bookingsResult.value.data : [])
      } else {
        console.error("❌ Failed to load bookings:", bookingsResult.reason)
        setBookings([])
        // Show warning but don't fail the entire page
        if (bookingsResult.reason?.response?.status === 500) {
          toast.warning("Bookings temporarily unavailable. Slots are still accessible.")
        }
      }
      
    } catch (error) {
      console.error("❌ Failed to fetch data:", error)
      // api.js will handle retry logic and show appropriate toasts
      setSlots([])
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const filteredSlots = slots.filter((slot) => {
    // If search query is empty, show all (don't filter by search)
    const matchesSearch = !searchQuery || 
      slot.slotNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slot.location?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "ALL" || slot.vehicleType === filterType
    const matchesStatus = filterStatus === "ALL" || slot.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })
  
  // Log filtered results for debugging
  useEffect(() => {
    console.log("🔍 Search Query:", searchQuery)
    console.log("📊 Total Slots:", slots.length)
    console.log("✅ Filtered Slots:", filteredSlots.length)
  }, [searchQuery, slots, filteredSlots.length])

  const stats = {
    totalSlots: slots.length,
    availableSlots: slots.filter((s) => s.status === "AVAILABLE").length,
    myBookings: bookings.length,
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
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
          
          {/* Search Bar Skeleton */}
          <Skeleton className="h-12 w-full rounded-lg bg-white/60" />
          
          {/* Slots Grid Skeleton - with shimmer effect */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="relative bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-xl p-6 overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Skeleton className="h-8 w-20 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-3 w-3 rounded-full" />
                </div>
                <div className="space-y-3 mb-5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-11 w-full rounded-lg" />
                
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    ease: 'linear',
                    repeatDelay: 0.5 
                  }}
                />
              </motion.div>
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
          className="relative bg-gradient-to-r from-purple-600 via-purple-500 to-purple-700 rounded-2xl p-8 text-white shadow-2xl overflow-hidden"
        >
          {/* Mesh pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-4xl font-bold mb-2"
              >
                Welcome back, {user?.fullName}!
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-white/90 text-lg"
              >
                Find and book your perfect parking spot
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Button
                onClick={() => {
                  setLoading(true)
                  fetchData()
                }}
                disabled={loading}
                variant="secondary"
                size="lg"
                className="gap-2 shadow-lg"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Cards with stagger animation */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatsCard title="Total Slots" value={stats.totalSlots} icon={Car} gradient="from-blue-500 to-cyan-500" index={0} />
          <StatsCard
            title="Available Now"
            value={stats.availableSlots}
            icon={Clock}
            gradient="from-green-500 to-emerald-500"
            index={1}
          />
          <StatsCard
            title="My Bookings"
            value={stats.myBookings}
            icon={Calendar}
            gradient="from-purple-500 to-pink-500"
            index={2}
          />
          <StatsCard
            title="Total Spent"
            value={stats.totalSpent}
            icon={DollarSign}
            gradient="from-orange-500 to-red-500"
            index={3}
            prefix="₹ "
            decimals={0}
          />
        </motion.div>

        {/* Map Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Bengaluru Parking Map</h2>
              <p className="text-sm text-slate-500">Tap a marker to book instantly</p>
            </div>
            <Button
              variant="outline"
              className="border-purple-500 text-purple-600 hover:bg-purple-50"
              onClick={() => navigate("/slots")}
            >
              Explore Full Map
            </Button>
          </div>
          <div className="h-[420px]">
            <MapView slots={slots} onSlotSelect={(slot) => navigate(`/book/${slot.id}`)} />
          </div>
        </motion.div>

        {/* Analytics Section */}
        <AnalyticsSection bookings={bookings} />

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col md:flex-row gap-4 items-center justify-between"
        >
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by slot number or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex h-10 w-full md:w-40 items-center justify-between rounded-md border border-purple-500 bg-purple-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option className="dropdown-option" value="ALL">All Types</option>
              <option className="dropdown-option" value="TWO_WHEELER">Bike</option>
              <option className="dropdown-option" value="FOUR_WHEELER">Car</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex h-10 w-full md:w-40 items-center justify-between rounded-md border border-purple-500 bg-purple-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option className="dropdown-option" value="ALL">All Status</option>
              <option className="dropdown-option" value="AVAILABLE">Available</option>
              <option className="dropdown-option" value="OCCUPIED">Occupied</option>
            </select>
            <div className="flex gap-1 border rounded-md p-1 bg-white/80 backdrop-blur-sm">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Slots Grid with stagger animation */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}
        >
          {filteredSlots.length > 0 ? (
            filteredSlots.map((slot, index) => (
              <SlotCard key={slot.id} slot={slot} index={index} onBook={() => navigate(`/book/${slot.id}`)} />
            ))
          ) : (
            <div className="col-span-full">
              <EmptyState
                type="search"
                title="No parking slots found"
                description="Try adjusting your search filters or check back later for availability"
              />
            </div>
          )}
        </motion.div>
      </main>
    </PageTransition>
  )
}

export default Dashboard
