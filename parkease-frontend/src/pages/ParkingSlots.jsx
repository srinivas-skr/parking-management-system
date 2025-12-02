import { useState, useEffect, useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Map, List, Search, MapPin, Navigation, X, ChevronLeft, ChevronRight } from "lucide-react"
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

// Popular areas in Bengaluru with coordinates
const popularAreas = [
  { name: "Koramangala", lat: 12.9352, lng: 77.6245, icon: "🏢" },
  { name: "Indiranagar", lat: 12.9719, lng: 77.6412, icon: "🎯" },
  { name: "Whitefield", lat: 12.9771, lng: 77.7265, icon: "💼" },
  { name: "MG Road", lat: 12.9756, lng: 77.6066, icon: "🛍️" },
  { name: "HSR Layout", lat: 12.9082, lng: 77.6476, icon: "🏠" },
  { name: "Electronic City", lat: 12.8426, lng: 77.6598, icon: "🏭" },
  { name: "Jayanagar", lat: 12.9250, lng: 77.5838, icon: "🌳" },
  { name: "Malleshwaram", lat: 13.0096, lng: 77.5679, icon: "🏛️" },
  { name: "BTM Layout", lat: 12.9165, lng: 77.6101, icon: "🏘️" },
  { name: "Yelahanka", lat: 13.0690, lng: 77.5857, icon: "✈️" },
  { name: "Marathahalli", lat: 12.9591, lng: 77.6974, icon: "🚗" },
  { name: "Basavanagudi", lat: 12.9428, lng: 77.5693, icon: "🐂" },
]

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
  const [selectedListArea, setSelectedListArea] = useState(null) // For list view area-based navigation
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

  // Group slots by nearest area for list view
  const areasWithSlots = useMemo(() => {
    return popularAreas.map(area => {
      // Find slots near this area (within 3km)
      const nearbySlots = filteredSlots.filter(slot => {
        const distance = calculateDistance(
          area.lat, area.lng,
          parseFloat(slot.latitude), parseFloat(slot.longitude)
        )
        return distance <= 3
      })
      return {
        ...area,
        slots: nearbySlots,
        slotCount: nearbySlots.length,
        freeCount: nearbySlots.filter(s => s.isFree || Number(s.pricePerHour) === 0).length,
        avgPrice: nearbySlots.length > 0 
          ? Math.round(nearbySlots.reduce((sum, s) => sum + Number(s.pricePerHour || 0), 0) / nearbySlots.length)
          : 0
      }
    }).filter(area => area.slotCount > 0) // Only show areas with slots
      .sort((a, b) => b.slotCount - a.slotCount) // Sort by slot count
  }, [filteredSlots])

  // Get slots for selected area in list view
  const selectedAreaSlots = useMemo(() => {
    if (!selectedListArea) return []
    const area = areasWithSlots.find(a => a.name === selectedListArea)
    return area ? area.slots : []
  }, [selectedListArea, areasWithSlots])

  // Handle area selection in list view
  const handleAreaClick = (areaName) => {
    setSelectedListArea(areaName)
    const area = areasWithSlots.find(a => a.name === areaName)
    if (area) {
      toast.success(`Showing ${area.slotCount} parking spots in ${areaName}`)
    }
  }

  // Go back to area list
  const handleBackToAreas = () => {
    setSelectedListArea(null)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />

      {/* PROFESSIONAL HEADER - Google Maps Inspired (Single Row) */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Back Button */}
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <span className="text-xl text-gray-600">←</span>
            </button>
            
            {/* Search Bar (Google Maps style) */}
            <div className="flex-1 flex items-center gap-2 sm:gap-3 bg-gray-50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 focus-within:border-purple-500 focus-within:bg-white focus-within:shadow-md transition-all">
              <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search Koramangala, MG Road..."
                className="flex-1 bg-transparent outline-none text-gray-800 text-sm sm:text-base min-w-0"
                value={selectedLocation?.name || ""}
                onChange={(e) => {
                  if (!e.target.value) setSelectedLocation(null)
                }}
                onClick={() => document.querySelector('.location-search-input')?.focus()}
              />
              
              {/* Clear Button */}
              {selectedLocation && (
                <button 
                  onClick={() => setSelectedLocation(null)}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              )}
              
              {/* Inline Filters - Hidden on mobile */}
              <div className="hidden lg:flex items-center gap-2 border-l border-gray-300 pl-3">
                
                {/* Free/Paid Toggle */}
                <select 
                  value={freeFilter}
                  onChange={(e) => setFreeFilter(e.target.value)}
                  className="text-sm bg-transparent border-none outline-none cursor-pointer text-gray-700 hover:text-gray-900"
                >
                  <option value="all">All Spots</option>
                  <option value="free">Free Only</option>
                  <option value="paid">Paid Only</option>
                </select>
                
                {/* Distance Filter */}
                <select 
                  value={distanceFilter}
                  onChange={(e) => setDistanceFilter(e.target.value)}
                  className="text-sm bg-transparent border-none outline-none cursor-pointer text-gray-700 hover:text-gray-900"
                >
                  <option value="all">Any Distance</option>
                  <option value="2">Within 2 km</option>
                  <option value="5">Within 5 km</option>
                  <option value="10">Within 10 km</option>
                </select>
                
                {/* Sort */}
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm bg-transparent border-none outline-none cursor-pointer text-gray-700 hover:text-gray-900"
                >
                  <option value="nearest">Nearest First</option>
                  <option value="price-low">Cheapest First</option>
                  <option value="price-high">Most Available</option>
                </select>
              </div>
            </div>
            
            {/* View Toggle (Split/Map) - Hidden on mobile */}
            <div className="hidden md:flex bg-gray-100 rounded-lg p-1">
              <button 
                onClick={() => setViewMode('split')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'split' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Split
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'map' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Map
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                List
              </button>
            </div>
            
            {/* User Avatar */}
            <button className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold hover:bg-purple-700 transition-colors flex-shrink-0">
              U
            </button>
          </div>
          
          {/* Mobile Filters Row */}
          <div className="flex lg:hidden items-center gap-2 mt-3 overflow-x-auto pb-1">
            <select 
              value={freeFilter}
              onChange={(e) => setFreeFilter(e.target.value)}
              className="text-xs bg-gray-100 border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 flex-shrink-0"
            >
              <option value="all">All</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
            <select 
              value={distanceFilter}
              onChange={(e) => setDistanceFilter(e.target.value)}
              className="text-xs bg-gray-100 border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 flex-shrink-0"
            >
              <option value="all">Any km</option>
              <option value="2">≤2 km</option>
              <option value="5">≤5 km</option>
            </select>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-gray-100 border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 flex-shrink-0"
            >
              <option value="nearest">Nearest</option>
              <option value="price-low">Cheapest</option>
            </select>
            
            {/* Mobile View Toggle */}
            <div className="flex md:hidden bg-gray-100 rounded-lg p-0.5 ml-auto flex-shrink-0">
              <button 
                onClick={() => setViewMode('split')}
                className={`px-2 py-1 rounded text-xs font-medium ${viewMode === 'split' ? 'bg-white shadow text-purple-600' : 'text-gray-500'}`}
              >
                Split
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`px-2 py-1 rounded text-xs font-medium ${viewMode === 'map' ? 'bg-white shadow text-purple-600' : 'text-gray-500'}`}
              >
                Map
              </button>
            </div>
          </div>
          
          {/* Results Count */}
          <div className="mt-2 text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{filteredSlots.length}</span> parking spots
            {selectedLocation && <span> near <span className="font-medium text-purple-600">{selectedLocation.name}</span></span>}
            {filters.vehicleType !== "all" && <span> • {filters.vehicleType === "TWO_WHEELER" ? "🏍️ Bike" : "🚗 Car"}</span>}
          </div>
        </div>
      </div>
      
      {/* Hidden LocationSearchBar for actual functionality */}
      <div className="hidden">
        <LocationSearchBar
          onLocationSelect={handleLocationSelect}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Main Content: Split View */}
      {loading ? (
        <div className="flex-1 p-4 overflow-auto bg-gray-50">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      ) : filteredSlots.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4 bg-gray-50">
          <Card className="border border-gray-200 bg-white p-8 sm:p-12 text-center shadow-sm max-w-md">
            <MapPin className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900">No parking spots found</h3>
            <p className="text-gray-500">
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
              overflow-y-auto border-r border-gray-200 bg-white
            `}>
              <div className="p-4">
                {/* List View: Show Areas First, then Slots */}
                {viewMode === "list" && !selectedListArea ? (
                  /* AREA CARDS VIEW */
                  <>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 sticky top-0 bg-white py-2 z-10">
                      📍 Select an Area ({areasWithSlots.length} areas with parking)
                    </h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {areasWithSlots.map((area, index) => (
                        <motion.button
                          key={area.name}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleAreaClick(area.name)}
                          className="group relative border border-gray-200 bg-white hover:border-purple-500 hover:bg-purple-50 rounded-xl p-5 text-left transition-all hover:shadow-lg"
                        >
                          {/* Area Icon */}
                          <div className="text-4xl mb-3">{area.icon}</div>
                          
                          {/* Area Name */}
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{area.name}</h3>
                          
                          {/* Stats Row */}
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-purple-600 font-semibold">{area.slotCount} spots</span>
                            {area.freeCount > 0 && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                                {area.freeCount} FREE
                              </span>
                            )}
                          </div>
                          
                          {/* Price Info */}
                          <div className="text-sm text-gray-500">
                            {area.avgPrice === 0 ? "Free parking available" : `Avg ₹${area.avgPrice}/hr`}
                          </div>
                          
                          {/* Arrow Indicator */}
                          <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="h-6 w-6 text-purple-500" />
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </>
                ) : viewMode === "list" && selectedListArea ? (
                  /* SLOTS IN SELECTED AREA VIEW */
                  <>
                    {/* Back Button + Title */}
                    <div className="sticky top-0 bg-white py-3 z-10 mb-4">
                      <button
                        onClick={handleBackToAreas}
                        className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-2 transition-colors"
                      >
                        <ChevronLeft className="h-5 w-5" />
                        <span className="font-medium">Back to Areas</span>
                      </button>
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        {areasWithSlots.find(a => a.name === selectedListArea)?.icon} {selectedListArea}
                        <span className="text-gray-500 font-normal text-base">
                          ({selectedAreaSlots.length} spots)
                        </span>
                      </h2>
                    </div>
                    
                    {/* Slot Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedAreaSlots.map((slot, index) => (
                        <motion.div
                          key={slot.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                        >
                          <SlotCard
                            slot={slot}
                            onBook={() => handleSlotSelect(slot)}
                            index={index}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  /* SPLIT VIEW: Show all slots in compact cards */
                  <>
                    <h2 className="text-base font-semibold text-gray-900 mb-4 sticky top-0 bg-white py-2">
                      {filteredSlots.length} parking spots 
                      {selectedLocation && <span className="text-gray-500 font-normal"> near {selectedLocation.name}</span>}
                    </h2>
                    
                    {/* Slot Cards */}
                    <div className="space-y-3">
                      {filteredSlots.map((slot, index) => (
                        <motion.div
                          key={slot.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          onMouseEnter={() => setHighlightedSlot(slot.id)}
                          onMouseLeave={() => setHighlightedSlot(null)}
                        >
                          {/* Compact card for split view - Professional Google Maps style */}
                          <button
                            onClick={() => handleSlotSelect(slot)}
                            className={`w-full text-left border rounded-lg p-3 transition-all hover:shadow-md ${
                              highlightedSlot === slot.id 
                                ? "border-purple-500 bg-purple-50 shadow-md" 
                                : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-gray-900 text-sm truncate">{slot.name || slot.location}</h3>
                                  {(slot.isFree || Number(slot.pricePerHour) === 0) ? (
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold flex-shrink-0">FREE</span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold flex-shrink-0">PAID</span>
                                  )}
                                </div>
                                <p className="text-gray-500 text-xs mb-2 truncate">{slot.address || slot.location}</p>
                                <div className="flex items-center gap-3 text-xs">
                                  <span className={`font-semibold ${Number(slot.pricePerHour) === 0 ? 'text-emerald-600' : 'text-blue-600'}`}>
                                    {Number(slot.pricePerHour) === 0 ? "Free" : `₹${slot.pricePerHour}/hr`}
                                  </span>
                                  {slot.distance !== undefined && (
                                    <span className="text-gray-500">
                                      {slot.distance.toFixed(1)} km
                                    </span>
                                  )}
                                  <span className="text-gray-400">
                                    {slot.vehicleType === "TWO_WHEELER" ? "🏍️" : "🚗"}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right ml-3 flex-shrink-0">
                                <div className={`text-lg font-bold ${slot.status === "AVAILABLE" ? "text-emerald-600" : "text-gray-400"}`}>
                                  {slot.capacity || "∞"}
                                </div>
                                <div className="text-[10px] text-gray-400">spots</div>
                              </div>
                            </div>
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
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
