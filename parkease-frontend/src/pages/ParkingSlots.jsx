import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Map, List, Search, MapPin, Navigation, X } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import Navbar from "../components/Navbar"
import MapView from "../components/MapView"
import LocationSearchBar from "../components/LocationSearchBar"
import SlotCard from "../components/SlotCard"
import { SkeletonCard } from "../components/SkeletonLoaders"
import { toast } from "sonner"
import { localParkingData } from "../data/localParkingData"
import { motion } from "framer-motion"

export default function ParkingSlots() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState("split") // "split", "map", or "list"
  const [slots, setSlots] = useState([])
  const [filteredSlots, setFilteredSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [openSearchPopup, setOpenSearchPopup] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [distanceFilter, setDistanceFilter] = useState("all") // "1km", "2km", "5km", "all"
  const [sortBy, setSortBy] = useState("nearest") // "nearest", "price-low", "price-high"
  const [freeFilter, setFreeFilter] = useState("all") // "all", "free", "paid"
  const [highlightedSlot, setHighlightedSlot] = useState(null)
  const [filters, setFilters] = useState({
    vehicleType: "all",
    priceRange: "all",
    status: "AVAILABLE",
  })

  // Handle URL parameters from Dashboard
  useEffect(() => {
    const vehicleType = searchParams.get("vehicleType")
    const area = searchParams.get("area")
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")

    if (vehicleType) {
      setFilters(prev => ({ ...prev, vehicleType }))
      toast.success(`Showing ${vehicleType === "TWO_WHEELER" ? "Bike" : "Car"} parking spots`)
    }

    if (area && lat && lng) {
      const location = {
        name: area,
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      }
      setSelectedLocation(location)
      setOpenSearchPopup(true)
      toast.success(`Showing parking near ${area}`)
    }
  }, [searchParams])

  useEffect(() => {
    // Auto-detect user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => console.log("Location not available")
      )
    }
    fetchSlots()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [slots, selectedLocation, filters, distanceFilter, sortBy, freeFilter, userLocation])

  const fetchSlots = async () => {
    try {
      setLoading(true)
      // Use local static data for quick frontend-only demo
      const slotsData = localParkingData || []
      console.log("🅿️ Parking slots loaded (local):", slotsData.length)
      setSlots(slotsData)
      setFilteredSlots(slotsData)
    } catch (error) {
      console.error("Error loading parking data:", error)
      toast.error("Failed to load parking data")
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...slots]

    // Add distance to each slot if user location available
    if (userLocation || selectedLocation) {
      const refLoc = selectedLocation || userLocation
      filtered = filtered.map((slot) => ({
        ...slot,
        distance: calculateDistance(
          refLoc.lat,
          refLoc.lng,
          parseFloat(slot.latitude),
          parseFloat(slot.longitude)
        ),
      }))
    }

    // Filter by distance radius
    if (distanceFilter !== "all" && (userLocation || selectedLocation)) {
      const maxDistance = parseInt(distanceFilter)
      filtered = filtered.filter((slot) => slot.distance <= maxDistance)
    }

    // Filter by location (if selected)
    if (selectedLocation) {
      filtered = filtered.filter((slot) => {
        const slotLat = parseFloat(slot.latitude)
        const slotLng = parseFloat(slot.longitude)
        const distance = calculateDistance(
          selectedLocation.lat,
          selectedLocation.lng,
          slotLat,
          slotLng
        )
        return distance <= 5 // Within 5km
      })
    }

    // Filter by vehicle type
    if (filters.vehicleType !== "all") {
      // Support both backend enums (TWO_WHEELER/FOUR_WHEELER) and frontend labels (Bike/Car)
      filtered = filtered.filter((slot) => {
        const vt = (slot.vehicleType || "").toString()
        return (
          vt === filters.vehicleType ||
          (filters.vehicleType === "TWO_WHEELER" && (vt === "Bike" || vt === "TWO_WHEELER")) ||
          (filters.vehicleType === "FOUR_WHEELER" && (vt === "Car" || vt === "FOUR_WHEELER"))
        )
      })
    }

    // Filter by free/paid selection
    if (freeFilter !== "all") {
      filtered = filtered.filter((slot) => {
        const isFree = slot.isFree === true || Number(slot.pricePerHour || slot.price || 0) === 0
        return freeFilter === "free" ? isFree : !isFree
      })
    }

    // Filter by price range
    if (filters.priceRange !== "all") {
      const [min, max] = filters.priceRange.split("-").map((v) => (v === "+" ? Infinity : parseInt(v)))
      filtered = filtered.filter((slot) => {
        const price = parseFloat(slot.pricePerHour)
        return max ? price >= min && price <= max : price >= min
      })
    }

    // Filter by status (normalize availability field to status)
    filtered = filtered.map(slot => ({
      ...slot,
      status: slot.status || slot.slotStatus || slot.availability || "AVAILABLE"
    }))
    
    if (filters.status !== "all") {
      filtered = filtered.filter(
        (slot) => slot.status === filters.status
      )
    }

    // Sort slots
    if (sortBy === "nearest") {
      // Check if distance is available on slots
      const hasDistance = filtered.some(s => s.distance !== undefined)
      if (hasDistance) {
        filtered.sort((a, b) => (a.distance || 999) - (b.distance || 999))
      } else {
        // Fallback: sort by price if no distance available
        filtered.sort((a, b) => parseFloat(a.pricePerHour || 0) - parseFloat(b.pricePerHour || 0))
      }
    } else if (sortBy === "price-low") {
      filtered.sort((a, b) => parseFloat(a.pricePerHour || 0) - parseFloat(b.pricePerHour || 0))
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => parseFloat(b.pricePerHour || 0) - parseFloat(a.pricePerHour || 0))
    }

    setFilteredSlots(filtered)
  }

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const handleLocationSelect = (location) => {
    setSelectedLocation(location)
    // Force MapView to show the "You are here" popup immediately
    setOpenSearchPopup(true)
    if (location) {
      toast.success(`Showing parking near ${location.name}`)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleSlotSelect = (slot) => {
    navigate(`/book/${slot.id}`)
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />

      {/* Header: Search + Filters - Full Width */}
      <div className="bg-gradient-to-r from-purple-800 to-purple-900 px-4 py-4 sm:py-6 border-b border-white/10">
        <div className="container mx-auto">
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Find Parking Slots</h1>
              <p className="text-white/60 text-sm">
                {selectedLocation
                  ? `Near ${selectedLocation.name}`
                  : filters.vehicleType !== "all"
                  ? `${filters.vehicleType === "TWO_WHEELER" ? "Bike/Scooter" : "Car/SUV"} spots`
                  : "Explore Bangalore"}
              </p>
            </div>
            
            {/* Active Filters + Count */}
            <div className="flex items-center gap-3 flex-wrap">
              {filters.vehicleType !== "all" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-600 text-white text-sm">
                  {filters.vehicleType === "TWO_WHEELER" ? "🏍️ Bike" : "🚗 Car"}
                  <button 
                    onClick={() => setFilters(prev => ({ ...prev, vehicleType: "all" }))}
                    className="ml-1 hover:bg-purple-500 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedLocation && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-600 text-white text-sm">
                  📍 {selectedLocation.name}
                  <button 
                    onClick={() => setSelectedLocation(null)}
                    className="ml-1 hover:bg-green-500 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <span className="text-white/60 text-sm font-medium">
                {filteredSlots.length} spots found
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <LocationSearchBar
              onLocationSelect={handleLocationSelect}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* View Mode Toggle - Hidden on mobile (always split on mobile) */}
            <div className="hidden lg:flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
              <Button
                size="sm"
                variant={viewMode === "split" ? "default" : "ghost"}
                onClick={() => setViewMode("split")}
                className={viewMode === "split" ? "bg-primary text-white" : "text-white/60 hover:text-white"}
              >
                Split
              </Button>
              <Button
                size="sm"
                variant={viewMode === "map" ? "default" : "ghost"}
                onClick={() => setViewMode("map")}
                className={viewMode === "map" ? "bg-primary text-white" : "text-white/60 hover:text-white"}
              >
                <Map className="mr-1 h-4 w-4" />
                Map
              </Button>
              <Button
                size="sm"
                variant={viewMode === "list" ? "default" : "ghost"}
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-primary text-white" : "text-white/60 hover:text-white"}
              >
                <List className="mr-1 h-4 w-4" />
                List
              </Button>
            </div>

            {/* Distance Filter */}
            <select
              value={distanceFilter}
              onChange={(e) => setDistanceFilter(e.target.value)}
              className="rounded-lg border border-purple-500 bg-purple-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-300 min-h-[40px]"
            >
              <option value="all">All Distances</option>
              <option value="1">Within 1 km</option>
              <option value="2">Within 2 km</option>
              <option value="5">Within 5 km</option>
            </select>
            
            {/* Free/Paid Toggle */}
            <div className="rounded-lg border border-purple-500 bg-purple-700 px-1 py-1 text-sm text-white flex items-center min-h-[40px]">
              <button
                onClick={() => setFreeFilter("all")}
                className={`px-2 py-1 rounded ${freeFilter === "all" ? "bg-white/20 font-semibold" : ""}`}
              >
                All
              </button>
              <button
                onClick={() => setFreeFilter("free")}
                className={`px-2 py-1 rounded flex items-center gap-1 ${freeFilter === "free" ? "bg-green-600 font-semibold" : ""}`}
              >
                <span className="text-[10px] px-1 py-0.5 rounded bg-green-400/30 font-bold">FREE</span>
              </button>
              <button
                onClick={() => setFreeFilter("paid")}
                className={`px-2 py-1 rounded ${freeFilter === "paid" ? "bg-red-600 font-semibold" : ""}`}
              >
                ₹ Paid
              </button>
            </div>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-purple-500 bg-purple-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-300 min-h-[40px]"
            >
              <option value="nearest">Nearest First</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content: Split View */}
      {loading ? (
        <div className="flex-1 p-4 overflow-auto">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      ) : filteredSlots.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="border-white/10 bg-white/5 p-8 sm:p-12 text-center backdrop-blur-xl max-w-md">
            <MapPin className="mx-auto mb-4 h-12 w-12 text-white/40" />
            <h3 className="mb-2 text-xl font-semibold text-white">No parking slots found</h3>
            <p className="text-white/60">
              Try adjusting your filters or search in a different location
            </p>
          </Card>
        </div>
      ) : (
        <div className={`flex-1 flex overflow-hidden ${
          viewMode === "list" ? "flex-col" : 
          viewMode === "map" ? "flex-col" : 
          "flex-col lg:flex-row"
        }`}>
          
          {/* LEFT PANEL: Slot List */}
          {(viewMode === "split" || viewMode === "list") && (
            <div className={`
              ${viewMode === "split" ? "w-full lg:w-2/5 h-[40vh] lg:h-full" : "flex-1"} 
              overflow-y-auto border-r border-white/10 bg-slate-900/50
            `}>
              <div className="p-4">
                <h2 className="text-lg font-semibold text-white mb-4 sticky top-0 bg-slate-900/90 py-2 backdrop-blur-sm">
                  {filteredSlots.length} parking spots 
                  {selectedLocation && <span className="text-white/60"> near {selectedLocation.name}</span>}
                </h2>
                
                {/* Slot Cards */}
                <div className={`space-y-4 ${viewMode === "list" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 space-y-0" : ""}`}>
                  {filteredSlots.map((slot, index) => (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onMouseEnter={() => setHighlightedSlot(slot.id)}
                      onMouseLeave={() => setHighlightedSlot(null)}
                    >
                      {viewMode === "split" ? (
                        /* Compact card for split view */
                        <button
                          onClick={() => handleSlotSelect(slot)}
                          className={`w-full text-left border-2 rounded-xl p-4 transition-all hover:shadow-lg ${
                            highlightedSlot === slot.id 
                              ? "border-purple-500 bg-purple-900/50" 
                              : "border-white/10 bg-white/5 hover:border-purple-400"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-white text-base">{slot.name || slot.location}</h3>
                                {(slot.isFree || Number(slot.pricePerHour) === 0) ? (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">FREE</span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold">PAID</span>
                                )}
                              </div>
                              <p className="text-white/50 text-sm mb-2">{slot.address || slot.location}</p>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-green-400 font-semibold">
                                  {Number(slot.pricePerHour) === 0 ? "Free" : `₹${slot.pricePerHour}/hr`}
                                </span>
                                {slot.distance !== undefined && (
                                  <span className="text-white/50">
                                    📍 {slot.distance.toFixed(1)} km
                                  </span>
                                )}
                                <span className="text-white/50">
                                  {slot.vehicleType === "TWO_WHEELER" ? "🏍️" : "🚗"}
                                </span>
                              </div>
                            </div>
                            <div className="text-right ml-3">
                              <div className={`text-lg font-bold ${slot.status === "AVAILABLE" ? "text-green-400" : "text-red-400"}`}>
                                {slot.capacity || "∞"}
                              </div>
                              <div className="text-[10px] text-white/40">spots</div>
                            </div>
                          </div>
                        </button>
                      ) : (
                        /* Full SlotCard for list view */
                        <SlotCard
                          slot={slot}
                          onBook={() => handleSlotSelect(slot)}
                          index={index}
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* RIGHT PANEL: Map */}
          {(viewMode === "split" || viewMode === "map") && (
            <div className={`
              ${viewMode === "split" ? "flex-1 h-[60vh] lg:h-full" : "flex-1"} 
              relative
            `}>
              <MapView
                slots={filteredSlots}
                onSlotSelect={handleSlotSelect}
                searchLocation={selectedLocation}
                openSearchPopup={openSearchPopup}
                onSearchPopupShown={() => setOpenSearchPopup(false)}
                highlightedSlotId={highlightedSlot}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
