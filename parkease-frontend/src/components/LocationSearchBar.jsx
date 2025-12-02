import { useState } from "react"
import { Search, MapPin, Navigation, Filter, X } from "lucide-react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"

// Bangalore locations with coordinates
const BANGALORE_LOCATIONS = [
  { name: "Koramangala", lat: 12.9352, lng: 77.6245, area: "South Bangalore" },
  { name: "Indiranagar", lat: 12.9719, lng: 77.6412, area: "East Bangalore" },
  { name: "MG Road", lat: 12.9756, lng: 77.6066, area: "Central Bangalore" },
  { name: "Electronic City", lat: 12.8451, lng: 77.6593, area: "South Bangalore" },
  { name: "Whitefield", lat: 12.9698, lng: 77.7499, area: "East Bangalore" },
  { name: "HSR Layout", lat: 12.9082, lng: 77.6476, area: "South Bangalore" },
  { name: "Jayanagar", lat: 12.9250, lng: 77.5838, area: "South Bangalore" },
  { name: "Marathahalli", lat: 12.9591, lng: 77.6974, area: "East Bangalore" },
  { name: "BTM Layout", lat: 12.9165, lng: 77.6101, area: "South Bangalore" },
  { name: "Bellandur", lat: 12.9258, lng: 77.6742, area: "East Bangalore" },
  { name: "Yeshwanthpur", lat: 13.0280, lng: 77.5365, area: "North Bangalore" },
  { name: "JP Nagar", lat: 12.9070, lng: 77.5850, area: "South Bangalore" },
]

export default function LocationSearchBar({ onLocationSelect, onFilterChange }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState({
    vehicleType: "all",
    priceRange: "all",
    status: "AVAILABLE",
  })
  const [showFilters, setShowFilters] = useState(false)

  // Filter locations based on search query
  const filteredLocations = BANGALORE_LOCATIONS.filter((location) =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.area.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleLocationClick = (location) => {
    setSearchQuery(location.name)
    setShowSuggestions(false)
    if (onLocationSelect) {
      onLocationSelect(location)
    }
  }

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...selectedFilters, [filterType]: value }
    setSelectedFilters(newFilters)
    if (onFilterChange) {
      onFilterChange(newFilters)
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    setShowSuggestions(false)
    if (onLocationSelect) {
      onLocationSelect(null)
    }
  }

  const handleSearchFocus = () => {
    setShowSuggestions(true)
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60" />
          <input
            type="text"
            placeholder="Search locations (e.g. Koramangala)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={handleSearchFocus}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                const exactMatch = BANGALORE_LOCATIONS.find((location) =>
                  location.name.toLowerCase() === searchQuery.toLowerCase()
                )
                const partialMatch = filteredLocations[0]
                const match = exactMatch || partialMatch
                if (match) {
                  handleLocationClick(match)
                }
              }
            }}
            className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-24 text-white placeholder-white/40 backdrop-blur-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-2">
            {searchQuery && (
              <Button
                size="sm"
                variant="ghost"
                onClick={clearSearch}
                className="h-8 w-8 p-0 text-white/60 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-8 bg-primary/20 text-white hover:bg-primary/30"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Location Suggestions */}
        {showSuggestions && searchQuery && filteredLocations.length > 0 && (
          <Card className="absolute z-50 mt-2 w-full border-white/10 bg-slate-900/95 p-2 shadow-xl backdrop-blur-xl">
            <div className="max-h-80 overflow-y-auto">
              {filteredLocations.map((location) => (
                <button
                  key={location.name}
                  onClick={() => handleLocationClick(location)}
                  className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-white/10"
                >
                  <MapPin className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <div className="font-medium text-white">{location.name}</div>
                    <div className="text-sm text-white/60">{location.area}</div>
                  </div>
                  <Navigation className="h-4 w-4 text-white/40" />
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Filters</h3>

            <div className="grid gap-4 sm:grid-cols-3">
              {/* Vehicle Type Filter */}
              <div className="space-y-2">
                <label className="text-sm text-white/80">Vehicle Type</label>
                <select
                  value={selectedFilters.vehicleType}
                  onChange={(e) => handleFilterChange("vehicleType", e.target.value)}
                  className="w-full rounded-lg border border-purple-500 bg-purple-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                >
                  <option className="dropdown-option" value="all">All Types</option>
                  <option className="dropdown-option" value="TWO_WHEELER">🏍️ Bike</option>
                  <option className="dropdown-option" value="FOUR_WHEELER">🚗 Car</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-2">
                <label className="text-sm text-white/80">Price Range</label>
                <select
                  value={selectedFilters.priceRange}
                  onChange={(e) => handleFilterChange("priceRange", e.target.value)}
                  className="w-full rounded-lg border border-purple-500 bg-purple-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                >
                  <option className="dropdown-option" value="all">All Prices</option>
                  <option className="dropdown-option" value="0-50">💰 Under ₹50/hr</option>
                  <option className="dropdown-option" value="50-100">💰💰 ₹50-₹100/hr</option>
                  <option className="dropdown-option" value="100+">💰💰💰 ₹100+/hr</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm text-white/80">Status</label>
                <select
                  value={selectedFilters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full rounded-lg border border-purple-500 bg-purple-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                >
                  <option className="dropdown-option" value="all">All Status</option>
                  <option className="dropdown-option" value="AVAILABLE">✅ Available Only</option>
                  <option className="dropdown-option" value="OCCUPIED">🔴 Occupied</option>
                  <option className="dropdown-option" value="RESERVED">🟠 Reserved</option>
                </select>
              </div>
            </div>

            {/* Quick Suggestions */}
            <div className="border-t border-white/10 pt-4">
              <p className="mb-2 text-sm text-white/60">Popular searches:</p>
              <div className="flex flex-wrap gap-2">
                {["Koramangala", "Indiranagar", "MG Road", "Whitefield"].map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      const location = BANGALORE_LOCATIONS.find((l) => l.name === loc)
                      if (location) handleLocationClick(location)
                    }}
                    className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-sm text-white transition-colors hover:bg-white/10"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
