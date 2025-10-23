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
import api from "../services/api"

export default function ParkingSlots() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState("map") // "map" or "list"
  const [slots, setSlots] = useState([])
  const [filteredSlots, setFilteredSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [filters, setFilters] = useState({
    vehicleType: "all",
    priceRange: "all",
    status: "AVAILABLE",
  })

  useEffect(() => {
    fetchSlots()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [slots, selectedLocation, filters])

  const fetchSlots = async () => {
    try {
      setLoading(true)
      const response = await api.get("/slots")
      const slotsData = response.data.data || response.data || []
      console.log("🅿️ Parking slots loaded:", slotsData.length)
      setSlots(slotsData)
      setFilteredSlots(slotsData)
    } catch (error) {
      console.error("Failed to fetch slots:", error)
      toast.error(error.response?.data?.message || "Failed to load parking slots")
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...slots]

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
      filtered = filtered.filter((slot) => slot.vehicleType === filters.vehicleType)
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
        <div className="mb-6 flex items-center justify-between">
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
            <MapView slots={filteredSlots} onSlotSelect={handleSlotSelect} />
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
