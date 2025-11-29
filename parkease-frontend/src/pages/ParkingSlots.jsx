import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Map, List, Search, MapPin } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import Navbar from "../components/Navbar"
import MapView from "../components/MapView"
import LocationSearchBar from "../components/LocationSearchBar"
import SlotCard from "../components/SlotCard"
import { SkeletonCard } from "../components/SkeletonLoaders"
import { toast } from "sonner"
import { localParkingData } from "../data/localParkingData"

export default function ParkingSlots() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState("map") // "map" or "list"
  const [slots, setSlots] = useState([])
  const [filteredSlots, setFilteredSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [openSearchPopup, setOpenSearchPopup] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [distanceFilter, setDistanceFilter] = useState("all") // "1km", "2km", "5km", "all"
  const [sortBy, setSortBy] = useState("nearest") // "nearest", "price-low", "price-high"
  const [freeFilter, setFreeFilter] = useState("all") // "all", "free", "paid"
  const [filters, setFilters] = useState({
    vehicleType: "all",
    priceRange: "all",
    status: "AVAILABLE",
  })

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
  }, [slots, selectedLocation, filters, distanceFilter, sortBy, userLocation])

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

    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter(
        (slot) => (slot.status || slot.slotStatus) === filters.status
      )
    }

    // Sort slots
    if (sortBy === "nearest" && filtered[0]?.distance !== undefined) {
      filtered.sort((a, b) => a.distance - b.distance)
    } else if (sortBy === "price-low") {
      filtered.sort((a, b) => parseFloat(a.pricePerHour) - parseFloat(b.pricePerHour))
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => parseFloat(b.pricePerHour) - parseFloat(a.pricePerHour))
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white">Find Parking Slots</h1>
          <p className="text-white/60">
            {selectedLocation
              ? `Showing parking near ${selectedLocation.name}`
              : "Explore parking spots across Bangalore"}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <LocationSearchBar
            onLocationSelect={handleLocationSelect}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* View Toggle */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-1">
            <Button
              size="sm"
              variant={viewMode === "map" ? "default" : "ghost"}
              onClick={() => setViewMode("map")}
              className={
                viewMode === "map"
                  ? "bg-primary text-white"
                  : "text-white/60 hover:text-white"
              }
            >
              <Map className="mr-2 h-4 w-4" />
              Map View
            </Button>
            <Button
              size="sm"
              variant={viewMode === "list" ? "default" : "ghost"}
              onClick={() => setViewMode("list")}
              className={
                viewMode === "list"
                  ? "bg-primary text-white"
                  : "text-white/60 hover:text-white"
              }
            >
              <List className="mr-2 h-4 w-4" />
              List View
            </Button>
          </div>

          {/* Distance & Sort Controls */}
          <div className="flex items-center gap-3">
            <select
              value={distanceFilter}
              onChange={(e) => setDistanceFilter(e.target.value)}
              className="rounded-lg border border-purple-500 bg-purple-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option className="dropdown-option" value="all">All Distances</option>
              <option className="dropdown-option" value="1">Within 1 km</option>
              <option className="dropdown-option" value="2">Within 2 km</option>
              <option className="dropdown-option" value="5">Within 5 km</option>
            </select>
            {/* Free/Paid toggle */}
            <div className="rounded-lg border border-purple-500 bg-purple-700 px-2 py-1 text-sm text-white flex items-center">
              <button
                onClick={() => setFreeFilter("all")}
                className={`px-2 py-1 rounded ${freeFilter === "all" ? "bg-white/10 font-semibold" : "bg-transparent"}`}
                aria-pressed={freeFilter === "all"}
              >
                All
              </button>
              <button
                onClick={() => setFreeFilter("free")}
                className={`px-2 py-1 rounded ${freeFilter === "free" ? "bg-green-600 font-semibold" : "bg-transparent"}`}
                aria-pressed={freeFilter === "free"}
                title="Show free parking only"
              >
                🆓 Free
              </button>
              <button
                onClick={() => setFreeFilter("paid")}
                className={`px-2 py-1 rounded ${freeFilter === "paid" ? "bg-red-600 font-semibold" : "bg-transparent"}`}
                aria-pressed={freeFilter === "paid"}
                title="Show paid parking only"
              >
                ₹ Paid
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-purple-500 bg-purple-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option className="dropdown-option" value="nearest">Nearest First</option>
              <option className="dropdown-option" value="price-low">Price: Low to High</option>
              <option className="dropdown-option" value="price-high">Price: High to Low</option>
            </select>
          </div>

          <div className="text-white/60">
            Showing {filteredSlots.length} of {slots.length} slots
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredSlots.length === 0 ? (
          <Card className="border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl">
            <MapPin className="mx-auto mb-4 h-12 w-12 text-white/40" />
            <h3 className="mb-2 text-xl font-semibold text-white">No parking slots found</h3>
            <p className="text-white/60">
              Try adjusting your filters or search in a different location
            </p>
          </Card>
        ) : viewMode === "map" ? (
          <div className="h-[600px] overflow-hidden rounded-xl">
            <MapView
              slots={filteredSlots}
              onSlotSelect={handleSlotSelect}
              searchLocation={selectedLocation}
              openSearchPopup={openSearchPopup}
              onSearchPopupShown={() => setOpenSearchPopup(false)}
            />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSlots.map((slot) => (
              <SlotCard
                key={slot.id}
                slot={slot}
                onBook={() => handleSlotSelect(slot)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
