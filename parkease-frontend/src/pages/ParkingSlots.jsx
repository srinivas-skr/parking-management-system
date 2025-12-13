import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Map, List, Search, MapPin, Navigation, X, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import Navbar from "../components/Navbar"
import MapView from "../components/MapView"
import LocationSearchBar from "../components/LocationSearchBar"
import SlotCard from "../components/SlotCard"
import { SkeletonCard } from "../components/SkeletonLoaders"
import { toast } from "sonner"
// Use OpenStreetMap real Bangalore parking data (120+ verified locations)
import { getRealtimeParkingData, calculateDistances, OSM_ATTRIBUTION, TOTAL_OSM_LOCATIONS } from "../data/osmParkingData"
import { motion } from "framer-motion"

// Popular areas in Bengaluru with coordinates
const popularAreas = [
  { name: "Koramangala", areaKey: "koramangala", lat: 12.9352, lng: 77.6245, icon: "🏢" },
  { name: "Indiranagar", areaKey: "indiranagar", lat: 12.9719, lng: 77.6412, icon: "🎯" },
  { name: "Whitefield", areaKey: "whitefield", lat: 12.9771, lng: 77.7265, icon: "💼" },
  { name: "MG Road", areaKey: "mg road", lat: 12.9756, lng: 77.6066, icon: "🛍️" },
  { name: "HSR Layout", areaKey: "hsr layout", lat: 12.9082, lng: 77.6476, icon: "🏠" },
  { name: "Electronic City", areaKey: "electronic city", lat: 12.8426, lng: 77.6598, icon: "🏭" },
  { name: "Jayanagar", areaKey: "jayanagar", lat: 12.9250, lng: 77.5838, icon: "🌳" },
  { name: "Malleshwaram", areaKey: "malleshwaram", lat: 13.0096, lng: 77.5679, icon: "🏛️" },
  { name: "BTM Layout", areaKey: "btm layout", lat: 12.9165, lng: 77.6101, icon: "🏘️" },
  { name: "Yelahanka", areaKey: "yelahanka", lat: 13.0690, lng: 77.5857, icon: "✈️" },
  { name: "Marathahalli", areaKey: "marathahalli", lat: 12.9591, lng: 77.6974, icon: "🚗" },
  { name: "Basavanagudi", areaKey: "basavanagudi", lat: 12.9428, lng: 77.5693, icon: "🐂" },
  { name: "Cubbon Park", areaKey: "cubbon park", lat: 12.9762, lng: 77.5929, icon: "🌳" },
  { name: "Majestic", areaKey: "majestic", lat: 12.9763, lng: 77.5713, icon: "🚌" },
  { name: "Banashankari", areaKey: "banashankari", lat: 12.9260, lng: 77.5400, icon: "🛕" },
  { name: "Bellandur", areaKey: "bellandur", lat: 12.9258, lng: 77.6742, icon: "🏢" },
  { name: "Airport", areaKey: "airport", lat: 13.1986, lng: 77.7066, icon: "✈️" },
  { name: "Rajajinagar", areaKey: "rajajinagar", lat: 12.9991, lng: 77.5560, icon: "🏭" },
  { name: "Kalyan Nagar", areaKey: "kalyan nagar", lat: 13.0280, lng: 77.6390, icon: "🏘️" },
]

// Strict keyword map per area to avoid cross-city bleed
const areaKeywordMap = {
  koramangala: ["koramangala", "kora", "forum mall"],
  indiranagar: ["indiranagar", "12th main", "100ft road"],
  whitefield: ["whitefield", "itpl", "vydehi", "hope farm", "ttmc"],
  "mg road": ["mg road", "m.g. road", "brigade road", "church street"],
  "hsr layout": ["hsr layout", "hsr sector", "hsr bda"],
  "electronic city": ["electronic city", "infosys", "wipro", "ecity", "phase 1", "phase 2"],
  jayanagar: ["jayanagar", "4th block", "9th block"],
  malleshwaram: ["malleshwaram", "malleswaram", "mantri mall", "sampige"],
  "btm layout": ["btm layout", "btm 1st", "btm 2nd"],
  yelahanka: ["yelahanka", "new town", "old town"],
  marathahalli: ["marathahalli", "marthahalli", "orr", "phoenix"],
  basavanagudi: ["basavanagudi", "basava", "bull temple", "dvg road"],
  majestic: ["majestic", "ksrtc", "ksr", "railway station", "kempegowda"],
  banashankari: ["banashankari", "bsk", "temple road"],
  bellandur: ["bellandur", "prestige", "shantiniketan"],
  airport: ["airport", "bial", "devanahalli", "kempegowda international"],
  rajajinagar: ["rajajinagar", "navrang"],
  "cubbon park": ["cubbon park", "cubbon", "vidhana soudha", "high court"],
  "kalyan nagar": ["kalyan nagar"],
}

const normalizeAreaKey = (value) => {
  if (!value) return null
  const normalized = String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[._-]+/g, " ")
    .trim()

  // Special case handling for common areas
  if (normalized.includes("hsr")) return "hsr layout"
  if (normalized.includes("btm")) return "btm layout"
  if (normalized.includes("electronic city") || normalized.includes("ecity")) return "electronic city"
  if (normalized.includes("mg road") || normalized.includes("m.g. road")) return "mg road"
  if (normalized.includes("cubbon")) return "cubbon park"
  if (normalized.includes("kalyan nagar")) return "kalyan nagar"
  if (normalized === "malleswaram") return "malleshwaram"
  
  return normalized
}

const getSelectedAreaKey = (location) => {
  if (!location || location.name === "Current Location") return null
  return location.areaKey || normalizeAreaKey(location.name)
}

const getSlotAreaKey = (slot) => {
  // 1. Direct area field - check ALL possible field names
  // Backend uses: areaName
  // OSM data uses: area, areaKey
  const directArea = slot?.areaName || slot?.areaKey || slot?.area
  if (directArea) {
    const normalized = normalizeAreaKey(directArea)
    if (normalized) return normalized
  }

  // 2. Text-based inference from ALL possible text fields (FALLBACK ONLY)
  // Backend uses: name, location, locationDescription
  // OSM uses: name, address
  const text = `${slot?.name || ""} ${slot?.address || ""} ${slot?.location || ""} ${slot?.locationDescription || ""}`.toLowerCase()
  
  // Strict inference: only match strong area indicators
  // Keys MUST match areaKeywordMap keys exactly
  const strict = {
    koramangala: ["koramangala", "kormangala", "forum mall"],
    indiranagar: ["indiranagar", "indira nagar", "100ft road"],
    whitefield: ["whitefield", "itpl", "hope farm", "vydehi"],
    "mg road": ["mg road", "m.g. road", "brigade", "church street"],
    "hsr layout": ["hsr layout", "hsr sector", "hsr bda"],
    "electronic city": ["electronic city", "ecity", "phase 1", "phase 2"],
    jayanagar: ["jayanagar"],
    malleshwaram: ["malleshwaram", "malleswaram"],
    "btm layout": ["btm layout", "btm 1st", "btm 2nd"],
    yelahanka: ["yelahanka"],
    marathahalli: ["marathahalli", "marthahalli"],
    basavanagudi: ["basavanagudi"],
    majestic: ["majestic", "ksrtc", "kempegowda", "ksr"],
    banashankari: ["banashankari", "bsk"],
    bellandur: ["bellandur"],
    airport: ["airport", "bial", "devanahalli"],
    rajajinagar: ["rajajinagar"],
    "kalyan nagar": ["kalyan nagar"],
    "cubbon park": ["cubbon park", "cubbon", "vidhana soudha"],
  }

  for (const [key, tokens] of Object.entries(strict)) {
    if (tokens.some(t => text.includes(t))) return key
  }
  return null
}

const getApiBaseUrl = () => {
  // Keep consistent with src/services/api.js default
  let apiBase = import.meta.env.VITE_API_URL || "https://parking-management-system-hs2i.onrender.com/api"
  if (apiBase.endsWith("/")) apiBase = apiBase.slice(0, -1)
  if (!apiBase.endsWith("/api")) apiBase += "/api"
  return apiBase
}

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
  const [showLocationDropdown, setShowLocationDropdown] = useState(true) // Show cities by default
  const [distanceFilter, setDistanceFilter] = useState("all") // "1km", "2km", "5km", "all"
  const [sortBy, setSortBy] = useState("nearest") // "nearest", "price-low", "price-high"
  const [freeFilter, setFreeFilter] = useState("all") // "all", "free", "paid"
  const [highlightedSlot, setHighlightedSlot] = useState(null)
  const [selectedListArea, setSelectedListArea] = useState(null) // For list view area-based navigation
  const [lastUpdated, setLastUpdated] = useState(null) // Real-time update timestamp
  const refreshIntervalRef = useRef(null)
  const [searchQuery, setSearchQuery] = useState("") // Search input text
  const [showSearchDropdown, setShowSearchDropdown] = useState(false) // Show/hide area dropdown
  const [filters, setFilters] = useState(() => {
    // Initialize filters from URL params immediately
    const urlParams = new URLSearchParams(window.location.search)
    const vehicleType = urlParams.get("vehicleType")
    console.log(`🚀 Initial vehicleType from URL: ${vehicleType}`)
    return {
      vehicleType: vehicleType ? vehicleType.toUpperCase() : "all",
      priceRange: "all",
      status: "AVAILABLE",
    }
  })

  // Handle URL parameters from Dashboard
  useEffect(() => {
    const vehicleType = searchParams.get("vehicleType")
    const area = searchParams.get("area")
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")

    console.log(`🚗 URL params - vehicleType: ${vehicleType}, area: ${area}`)

    // Set vehicle type filter if provided - STRICT ENFORCEMENT
    if (vehicleType) {
      console.log(`✅ Setting vehicle type filter to: ${vehicleType}`)
      setFilters(prev => ({ ...prev, vehicleType: vehicleType.toUpperCase() }))
    }

    if (area && lat && lng) {
      const location = {
        name: area,
        areaKey: normalizeAreaKey(area),
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      }
      setSelectedLocation(location)
      setOpenSearchPopup(true)
      setShowLocationDropdown(false) // Hide dropdown once location is selected
    }
  }, [searchParams])

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showSearchDropdown && !e.target.closest('.search-container')) {
        setShowSearchDropdown(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showSearchDropdown])

  const detectLocation = () => {
    if (navigator.geolocation) {
      toast.info("Detecting your location...")
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(userPos)
          
          const currentLocationObj = {
            name: "Current Location",
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            icon: "📍"
          }
          setSelectedLocation(currentLocationObj)
          setDistanceFilter("2") // Default to 2km for current location
          setShowLocationDropdown(false)
          toast.success("Location detected successfully")
        },
        (error) => {
          console.log("Location not available", error)
          toast.error("Could not detect location. Please enable location services.")
        }
      )
    } else {
      toast.error("Geolocation is not supported by your browser")
    }
  }

  useEffect(() => {
    // Auto-detect removed - now manual only via button
    
    fetchSlots()
    
    // Set up real-time refresh every 30 seconds
    refreshIntervalRef.current = setInterval(() => {
      refreshSlotsQuietly()
    }, 30000)
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [])

  // Quiet refresh - updates slots without loading state
  const refreshSlotsQuietly = useCallback(async () => {
    try {
      const apiUrl = `${getApiBaseUrl()}/slots`
      const response = await fetch(apiUrl)
      if (response.ok) {
        const freshData = await response.json()
        const availableSlots = freshData.filter(slot => 
          slot.slotStatus === 'AVAILABLE' || slot.slotStatus === 'available'
        )
        
        if (availableSlots.length > 0) {
          setSlots(availableSlots)
          setLastUpdated(new Date())
        }
      }
    } catch (error) {
      console.error("Error refreshing parking data:", error)
    }
  }, [])

  useEffect(() => {
    applyFilters()
  }, [slots, selectedLocation, filters, distanceFilter, sortBy, freeFilter, userLocation])

  const fetchSlots = async () => {
    try {
      setLoading(true)
      
      // Always get OSM data as base (129 locations × 2 vehicle types = 258 slots)
      const osmData = getRealtimeParkingData()
      console.log(`📍 OSM data: ${osmData.length} demo slots`)
      
      // Try to fetch real parking slots from backend API
      let backendSlots = []
      try {
        const apiUrl = `${getApiBaseUrl()}/slots`
        console.log('🔗 Fetching from:', apiUrl)
        
        const response = await fetch(apiUrl)
        
        if (response.ok) {
          const slotsData = await response.json()
          console.log(`🅿️ Backend response: ${slotsData.length} slots`)
          
          // Filter to show only AVAILABLE slots
          backendSlots = slotsData.filter(slot => 
            slot.status === 'AVAILABLE' || slot.slotStatus === 'AVAILABLE' ||
            slot.status === 'available' || slot.slotStatus === 'available'
          ).map(slot => ({
            ...slot,
            slotStatus: slot.status || slot.slotStatus,
            pricePerHour: slot.pricePerHour || 0,
            dataSource: 'Backend'
          }))
          
          console.log(`✅ Available backend slots: ${backendSlots.length}`)
        }
      } catch (error) {
        console.log('⚠️ Backend unavailable, using OSM data only')
      }
      
      // COMBINE: Backend slots (priority) + OSM slots (for coverage)
      // This ensures every location has slots for both vehicle types
      const combinedSlots = [...backendSlots, ...osmData]
      
      console.log(`📦 Total combined slots: ${combinedSlots.length}`)
      console.log(`🔍 Current vehicle filter: ${filters.vehicleType}`)
      
      setSlots(combinedSlots)
      // DON'T set filteredSlots directly - let applyFilters handle it via useEffect
      
      // Unified message - no confusing "demo" vs "real" distinction
      const totalLocations = Math.floor(combinedSlots.length / 2) // Each location has 2 vehicle types
      toast.success(`Loaded ${combinedSlots.length} parking spots from ${totalLocations} locations`)
      
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error loading parking data:", error)
      toast.error("Using demo data (backend unavailable)")
      // Fallback to OSM data if backend fails
      const fallbackData = getRealtimeParkingData()
      setSlots(fallbackData)
      setFilteredSlots(fallbackData)
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

    // 1. STRICT LOCATION FILTERING (Highest Priority)
    if (selectedLocation) {
      // A. GPS/Current Location Mode: Use Distance
      if (selectedLocation.name === "Current Location") {
        if (distanceFilter !== "all") {
          const maxDistance = parseInt(distanceFilter)
          filtered = filtered.filter((slot) => slot.distance <= maxDistance)
        }
      } 
      // B. Named Location Mode: Use Strict Text Matching only (no distance)
      else {
        const selectedAreaKey = getSelectedAreaKey(selectedLocation)
        console.log(`🎯 Selected area key: "${selectedAreaKey}" from "${selectedLocation.name}"`)

        // If it's one of our known areas, filter by areaKey only (prevents cross-area bleeding).
        if (selectedAreaKey && (selectedAreaKey in areaKeywordMap)) {
          const beforeCount = filtered.length
          console.log(`🔍 Filtering for area: "${selectedAreaKey}"`)
          
          // DEBUG: Log first 5 slots and their area keys
          filtered.slice(0, 5).forEach((slot, i) => {
            const slotKey = getSlotAreaKey(slot)
            console.log(`  Slot ${i}: "${slot.name?.substring(0, 30)}" → areaName="${slot.areaName}", area="${slot.area}", computed="${slotKey}"`)
          })
          
          filtered = filtered.filter((slot) => {
            const slotAreaKey = getSlotAreaKey(slot)
            const match = slotAreaKey === selectedAreaKey
            return match
          })
          console.log(`🎯 Area filter: ${beforeCount} → ${filtered.length} slots for "${selectedAreaKey}"`)
        } else {
          // Fallback for ad-hoc searched places: use a conservative contains match.
          const targetName = selectedLocation.name.toLowerCase()
          filtered = filtered.filter((slot) => {
            const slotText = (slot.name + " " + (slot.address || "")).toLowerCase()
            return slotText.includes(targetName)
          })
        }
      }
    }
    // C. Search Query Fallback (if no location selected but user typed something)
    else if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(slot => 
        slot.name.toLowerCase().includes(query) || 
        (slot.address && slot.address.toLowerCase().includes(query))
      )
    }
    // D. Default Distance Filter (if no named location selected)
    else if (distanceFilter !== "all" && userLocation) {
      const maxDistance = parseInt(distanceFilter)
      filtered = filtered.filter((slot) => slot.distance <= maxDistance)
    }

    // Filter by vehicle type FIRST AND STRICTLY (before other filters)

    // Filter by vehicle type FIRST AND STRICTLY (before other filters)
    if (filters.vehicleType && filters.vehicleType !== "all") {
      const filterType = filters.vehicleType.toUpperCase()
      console.log(`🔍 Filtering by vehicle type: ${filterType}`)
      
      filtered = filtered.filter((slot) => {
        const slotVehicleType = (slot.vehicleType || "").toString().toUpperCase()
        
        // Strict matching - TWO_WHEELER only shows bikes, FOUR_WHEELER only shows cars
        if (filterType === "TWO_WHEELER") {
          const isBike = slotVehicleType === "TWO_WHEELER" || slotVehicleType === "BIKE" || slotVehicleType === "TWO WHEELER"
          return isBike
        } else if (filterType === "FOUR_WHEELER") {
          const isCar = slotVehicleType === "FOUR_WHEELER" || slotVehicleType === "CAR" || slotVehicleType === "FOUR WHEELER"
          return isCar
        }
        
        return slotVehicleType === filterType
      })
      
      console.log(`✅ After vehicle filter: ${filtered.length} slots`)
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
        filtered.sort((a, b) => {
          // PRIMARY SORT: Match Score (High priority for name/address matches)
          if (selectedLocation) {
            const getMatchScore = (slot) => {
              const text = (slot.name + " " + (slot.address || "")).toLowerCase()
              const targetName = selectedLocation.name.toLowerCase()
              
              // 1. Exact/Strong Match (100 pts)
              // e.g. "HSR Layout" in "HSR Layout Sector 1"
              if (text.includes(targetName)) return 100
              
              // 2. Partial Term Match (50 pts)
              // e.g. "HSR" in "HSR BDA Complex"
              const terms = targetName
                .replace(/layout|road|area|city|block|phase|stage/g, "")
                .trim()
                .split(" ")
                .filter(t => t.length > 1)
                
              if (terms.length > 0 && terms.some(term => text.includes(term))) {
                return 50
              }
              
              return 0
            }
            
            const scoreA = getMatchScore(a)
            const scoreB = getMatchScore(b)
            
            // If scores are different, higher score wins
            if (scoreA !== scoreB) {
              return scoreB - scoreA
            }
          }
          
          // SECONDARY SORT: Distance (Nearest first)
          return (a.distance || 999) - (b.distance || 999)
        })
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
      {/* Navbar - Hidden on mobile for more space */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* RESPONSIVE HEADER - Different on Mobile vs Desktop     */}
      {/* ═══════════════════════════════════════════════════════ */}
      
      {/* MOBILE HEADER (< 768px) */}
      <div className="md:hidden bg-white border-b border-gray-200 shadow-sm">
        <div className="p-3">
          {/* Row 1: Back + Title + Vehicle Badge */}
          <div className="flex items-center gap-3 mb-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-xl text-gray-600">←</span>
            </button>
            <h1 className="text-lg font-bold text-gray-900 flex-1">Find Parking</h1>
            
            {/* VEHICLE TYPE BADGE - Only show if specific type selected */}
            {filters.vehicleType && filters.vehicleType !== "all" && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${
                filters.vehicleType === "TWO_WHEELER" 
                  ? "bg-green-100 text-green-700 border-2 border-green-300" 
                  : "bg-blue-100 text-blue-700 border-2 border-blue-300"
              }`}>
                <span className="text-base">{filters.vehicleType === "TWO_WHEELER" ? "🏍️" : "🚗"}</span>
                <span className="hidden sm:inline">{filters.vehicleType === "TWO_WHEELER" ? "Bike" : "Car"}</span>
              </div>
            )}
          </div>
          
          {/* Row 2: PROMINENT Search Bar with Location Suggestions */}
          <div className="relative search-container">
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl px-4 py-3 border-2 border-purple-200 shadow-sm mb-2">
              <MapPin className="h-5 w-5 text-purple-500" />
              <input
                type="text"
                placeholder="📍 Search area: Koramangala, MG Road..."
                className="flex-1 bg-transparent outline-none text-sm text-gray-800 font-medium placeholder:text-gray-500"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowSearchDropdown(true)
                  setShowLocationDropdown(true)
                }}
                onFocus={() => {
                  setShowSearchDropdown(true)
                  if (!selectedLocation) setShowLocationDropdown(true)
                }}
              />
              {(searchQuery || selectedLocation) && (
                <button onClick={() => {
                  setSearchQuery("")
                  setSelectedLocation(null)
                  setShowSearchDropdown(false)
                  setShowLocationDropdown(true) // Show cities again
                }} className="p-1">
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>
            
            {/* Search Dropdown - Mobile - ENHANCED with better styling */}
            {showSearchDropdown && showLocationDropdown && (
              <div className="absolute top-full left-0 right-0 bg-white border-2 border-purple-100 rounded-xl shadow-xl z-50 max-h-72 overflow-y-auto mt-1">
                <div className="px-4 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
                  <span className="text-xs font-semibold text-purple-600">📍 Popular Locations</span>
                </div>
                {popularAreas
                  .filter(area => area.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((area, index) => (
                    <button
                      key={area.name}
                      onClick={() => {
                        setSelectedLocation(area)
                        setSearchQuery(area.name)
                        setShowSearchDropdown(false)
                        setShowLocationDropdown(false) // Hide city dropdown
                        setOpenSearchPopup(true)
                        toast.success(`Showing parking near ${area.name}`)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 text-left border-b border-gray-100 last:border-0 transition-colors"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">{area.icon}</span>
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-gray-800">{area.name}</span>
                        <p className="text-xs text-gray-500">Bengaluru</p>
                      </div>
                      <span className="text-purple-500 text-sm">→</span>
                    </button>
                  ))}
                {popularAreas.filter(area => area.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">No areas found matching "{searchQuery}"</div>
                )}
              </div>
            )}
            
          </div>
          
          {/* Row 3: Filters (Horizontal scroll) */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 mt-3">
            <select 
              value={freeFilter}
              onChange={(e) => setFreeFilter(e.target.value)}
              className="text-xs bg-gray-100 rounded-lg px-3 py-2 border-none outline-none text-gray-700 flex-shrink-0"
            >
              <option value="all">All Spots</option>
              <option value="free">Free Only</option>
              <option value="paid">Paid Only</option>
            </select>
            <select 
              value={distanceFilter}
              onChange={(e) => setDistanceFilter(e.target.value)}
              className="text-xs bg-gray-100 rounded-lg px-3 py-2 border-none outline-none text-gray-700 flex-shrink-0"
            >
              <option value="all">Any Distance</option>
              <option value="2">Within 2 km</option>
              <option value="5">Within 5 km</option>
            </select>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-gray-100 rounded-lg px-3 py-2 border-none outline-none text-gray-700 flex-shrink-0"
            >
              <option value="nearest">Nearest</option>
              <option value="price-low">Cheapest</option>
            </select>
          </div>
          
          {/* Row 4: Results count + Real-time status */}
          <div className="mt-2 flex items-center justify-between">
            <div className="text-xs text-gray-600">
              <span className="font-semibold text-gray-900">{filteredSlots.length}</span> spots found
              {selectedLocation && <span className="text-purple-600"> near {selectedLocation.name}</span>}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              Live • OSM
            </div>
          </div>
        </div>
      </div>
      
      {/* DESKTOP HEADER (≥ 768px) */}
      <div className="hidden md:block bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto p-4">
          <div className="flex items-center gap-4">
            
            {/* Back Button */}
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-2xl text-gray-600">←</span>
            </button>
            
            {/* Search Bar with Inline Filters */}
            <div className="relative flex-1 search-container">
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus-within:border-purple-500 focus-within:bg-white focus-within:shadow-md transition-all">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search parking near Koramangala, MG Road..."
                  className="flex-1 bg-transparent outline-none text-gray-800"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowSearchDropdown(true)
                    setShowLocationDropdown(true)
                  }}
                  onFocus={() => {
                    setShowSearchDropdown(true)
                    if (!selectedLocation) setShowLocationDropdown(true)
                  }}
                />
                {(searchQuery || selectedLocation) && (
                  <button onClick={() => {
                    setSearchQuery("")
                    setSelectedLocation(null)
                    setShowSearchDropdown(false)
                    setShowLocationDropdown(true)
                  }} className="p-1 hover:bg-gray-200 rounded-full">
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                )}
                
                {/* Inline Filters (Desktop only) */}
                <div className="flex items-center gap-3 border-l border-gray-300 pl-4">
                <select 
                  value={freeFilter}
                  onChange={(e) => setFreeFilter(e.target.value)}
                  className="text-sm bg-transparent border-none outline-none cursor-pointer text-gray-700"
                >
                  <option value="all">All Spots</option>
                  <option value="free">Free Only</option>
                  <option value="paid">Paid Only</option>
                </select>
                <select 
                  value={distanceFilter}
                  onChange={(e) => setDistanceFilter(e.target.value)}
                  className="text-sm bg-transparent border-none outline-none cursor-pointer text-gray-700"
                >
                  <option value="all">Any Distance</option>
                  <option value="2">Within 2 km</option>
                  <option value="5">Within 5 km</option>
                  <option value="10">Within 10 km</option>
                </select>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm bg-transparent border-none outline-none cursor-pointer text-gray-700"
                >
                  <option value="nearest">Nearest First</option>
                  <option value="price-low">Cheapest First</option>
                  <option value="price-high">Highest Price</option>
                </select>
                </div>
              </div>
              
              {/* Search Dropdown - Desktop - ENHANCED */}
              {showSearchDropdown && showLocationDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-purple-100 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto">
                  <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100 rounded-t-2xl">
                    <span className="text-sm font-semibold text-purple-700">📍 Select Location in Bengaluru</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 p-2">
                    {popularAreas
                      .filter(area => area.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((area, index) => (
                        <button
                          key={area.name}
                          onClick={() => {
                            setSelectedLocation(area)
                            setSearchQuery(area.name)
                            setShowSearchDropdown(false)
                            setShowLocationDropdown(false) // Hide city dropdown
                            setOpenSearchPopup(true)
                            toast.success(`Showing parking near ${area.name}`)
                          }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 rounded-xl text-left transition-all hover:scale-[1.02]"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-2xl">{area.icon}</span>
                          </div>
                          <div className="flex-1">
                            <span className="font-semibold text-gray-800">{area.name}</span>
                            <p className="text-xs text-gray-500">Bengaluru</p>
                          </div>
                        </button>
                      ))}
                  </div>
                  {popularAreas.filter(area => area.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                    <div className="px-4 py-6 text-center text-gray-500">
                      <span className="text-3xl mb-2 block">🔍</span>
                      No areas found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
              
            </div>
            
            {/* View Toggle (Desktop only) */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button 
                onClick={() => setViewMode('split')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'split' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Split View
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'map' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Map Only
              </button>
            </div>
            
            {/* VEHICLE TYPE BADGE - Only show if specific type selected (Desktop) */}
            {filters.vehicleType && filters.vehicleType !== "all" && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold shadow-sm ${
                filters.vehicleType === "TWO_WHEELER" 
                  ? "bg-green-100 text-green-700 border-2 border-green-300" 
                  : "bg-blue-100 text-blue-700 border-2 border-blue-300"
              }`}>
                <span className="text-xl">{filters.vehicleType === "TWO_WHEELER" ? "🏍️" : "🚗"}</span>
                <div>
                  <div className="text-xs text-gray-500 font-normal">Selected</div>
                  <div className="text-sm">{filters.vehicleType === "TWO_WHEELER" ? "Two Wheeler" : "Four Wheeler"}</div>
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="ml-2 px-2 py-1 bg-white/70 hover:bg-white rounded text-xs font-semibold text-purple-600 transition-colors"
                >
                  Change
                </button>
              </div>
            )}
          </div>
          
          {/* Results Count + Real-time Status */}
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{filteredSlots.length}</span> parking spots found
              {selectedLocation && <span> near <span className="font-medium text-purple-600">{selectedLocation.name}</span></span>}
              {filters.vehicleType !== "all" && <span> • {filters.vehicleType === "TWO_WHEELER" ? "🏍️ Bike" : "🚗 Car"}</span>}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span>Live data</span>
              </div>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">📍 {TOTAL_OSM_LOCATIONS} OpenStreetMap locations</span>
              {lastUpdated && (
                <>
                  <span className="text-gray-300">|</span>
                  <span>Updated {lastUpdated.toLocaleTimeString()}</span>
                </>
              )}
            </div>
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
      ) : !selectedLocation && showLocationDropdown ? (
        <div className="flex-1 p-4 overflow-auto bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Select a Location</h2>
                <p className="text-gray-600">Choose an area in Bengaluru to find parking spots nearby</p>
              </div>
              <button
                onClick={detectLocation}
                className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium whitespace-nowrap"
              >
                <Navigation className="w-4 h-4" />
                Auto-detect my location
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularAreas.map((area) => (
                <motion.button
                  key={area.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedLocation(area)
                    setSearchQuery(area.name)
                    setShowSearchDropdown(false)
                    setShowLocationDropdown(false)
                    setOpenSearchPopup(true)
                    toast.success(`Showing parking near ${area.name}`)
                  }}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all text-left flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {area.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">{area.name}</h3>
                    <p className="text-xs text-gray-500">Bengaluru</p>
                  </div>
                </motion.button>
              ))}
            </div>
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
        <>
          {/* ═══════════════════════════════════════════════════════ */}
          {/* MOBILE LAYOUT: Stacked (Map on top, List below)        */}
          {/* ═══════════════════════════════════════════════════════ */}
          <div className="md:hidden flex flex-col h-full overflow-hidden">
            
            {/* MAP - Top section (40vh on mobile) */}
            <div className="relative h-[40vh] border-b border-gray-200 flex-shrink-0">
              <MapView
                slots={filteredSlots}
                onSlotSelect={handleSlotSelect}
                searchLocation={selectedLocation}
                openSearchPopup={openSearchPopup}
                onSearchPopupShown={() => setOpenSearchPopup(false)}
                highlightedSlotId={highlightedSlot}
              />
            </div>
            
            {/* SLOT LIST - Bottom section (60vh, scrollable) */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
              <div className="p-3 space-y-3">
                {filteredSlots.map((slot, index) => (
                  <motion.div
                    key={slot.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    {/* Mobile Slot Card - Compact */}
                    <button
                      onClick={() => handleSlotSelect(slot)}
                      className="w-full bg-white rounded-lg p-3 shadow-sm border border-gray-100 text-left active:scale-[0.98] transition-transform"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-sm text-gray-900 truncate">{slot.name || slot.location}</h3>
                            {(slot.isFree || Number(slot.pricePerHour) === 0) ? (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold flex-shrink-0">FREE</span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold flex-shrink-0">PAID</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{slot.address || slot.location}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs">
                            <span className={`font-semibold ${Number(slot.pricePerHour) === 0 ? 'text-emerald-600' : 'text-blue-600'}`}>
                              {Number(slot.pricePerHour) === 0 ? "Free" : `₹${slot.pricePerHour}/hr`}
                            </span>
                            {slot.distance != null && (
                              <span className="text-gray-500">{Number(slot.distance).toFixed(1)} km</span>
                            )}}
                            <span className="text-gray-400">{slot.vehicleType === "TWO_WHEELER" ? "🏍️" : "🚗"}</span>
                          </div>
                        </div>
                        <div className="text-right ml-2 flex-shrink-0">
                          <div className={`text-base font-bold ${slot.status === "AVAILABLE" ? "text-emerald-600" : "text-gray-400"}`}>
                            {slot.capacity || "∞"}
                          </div>
                          <div className="text-[9px] text-gray-400">spots</div>
                        </div>
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          
          {/* ═══════════════════════════════════════════════════════ */}
          {/* DESKTOP LAYOUT: Side-by-side (List 40% | Map 60%)      */}
          {/* ═══════════════════════════════════════════════════════ */}
          <div className={`hidden md:flex h-full overflow-hidden ${
            viewMode === "map" ? "" : ""
          }`}>
            
            {/* LEFT: SLOT LIST (40% width) - Hidden in map-only mode */}
            {viewMode !== "map" && (
              <div className="w-2/5 overflow-y-auto border-r border-gray-200 bg-white">
                <div className="p-4">
                  {/* List View: Show Areas First, then Slots */}
                  {viewMode === "list" && !selectedListArea ? (
                    /* AREA CARDS VIEW */
                    <>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4 sticky top-0 bg-white py-2 z-10">
                        📍 Select an Area ({areasWithSlots.length} areas with parking)
                      </h2>
                      
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {areasWithSlots.map((area, index) => (
                          <motion.button
                            key={area.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleAreaClick(area.name)}
                            className="group relative border border-gray-200 bg-white hover:border-purple-500 hover:bg-purple-50 rounded-xl p-5 text-left transition-all hover:shadow-lg"
                          >
                            <div className="text-3xl mb-2">{area.icon}</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{area.name}</h3>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-purple-600 font-semibold text-sm">{area.slotCount} spots</span>
                              {area.freeCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                                  {area.freeCount} FREE
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {area.avgPrice === 0 ? "Free parking" : `Avg ₹${area.avgPrice}/hr`}
                            </div>
                            <ChevronRight className="absolute top-1/2 right-3 -translate-y-1/2 h-5 w-5 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </motion.button>
                        ))}
                      </div>
                    </>
                  ) : viewMode === "list" && selectedListArea ? (
                    /* SLOTS IN SELECTED AREA VIEW */
                    <>
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
                          <span className="text-gray-500 font-normal text-base">({selectedAreaSlots.length} spots)</span>
                        </h2>
                      </div>
                      
                      <div className="space-y-3">
                        {selectedAreaSlots.map((slot, index) => (
                          <motion.div
                            key={slot.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                          >
                            <SlotCard slot={slot} onBook={() => handleSlotSelect(slot)} index={index} />
                          </motion.div>
                        ))}
                      </div>
                    </>
                  ) : (
                    /* SPLIT VIEW: Show all slots */
                    <>
                      <h2 className="text-base font-semibold text-gray-900 mb-4 sticky top-0 bg-white py-2 z-10">
                        {filteredSlots.length} parking spots
                        {selectedLocation && <span className="text-gray-500 font-normal"> near {selectedLocation.name}</span>}
                      </h2>
                      
                      <div className="space-y-3">
                        {filteredSlots.map((slot, index) => (
                          <motion.div
                            key={slot.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02 }}
                            onMouseEnter={() => setHighlightedSlot(slot.id)}
                            onMouseLeave={() => setHighlightedSlot(null)}
                          >
                            {/* Desktop Slot Card */}
                            <button
                              onClick={() => handleSlotSelect(slot)}
                              className={`w-full text-left border-2 rounded-xl p-4 transition-all hover:shadow-lg ${
                                highlightedSlot === slot.id 
                                  ? "border-purple-500 bg-purple-50 shadow-lg" 
                                  : "border-gray-200 bg-white hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-base text-gray-900 truncate">{slot.name || slot.location}</h3>
                                    {(slot.isFree || Number(slot.pricePerHour) === 0) ? (
                                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-xs font-bold">FREE</span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-bold">PAID</span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500 mb-2">{slot.address || slot.location}</p>
                                  <div className="flex items-center gap-4 text-sm">
                                    <span className={`font-semibold ${Number(slot.pricePerHour) === 0 ? 'text-emerald-600' : 'text-blue-600'}`}>
                                      {Number(slot.pricePerHour) === 0 ? "Free" : `₹${slot.pricePerHour}/hr`}
                                    </span>
                                    {slot.distance != null && (
                                      <span className="text-gray-500">📍 {Number(slot.distance).toFixed(1)} km</span>
                                    )}
                                    <span className="text-gray-400">{slot.vehicleType === "TWO_WHEELER" ? "🏍️ Bike" : "🚗 Car"}</span>
                                  </div>
                                </div>
                                <div className="text-right ml-4 flex-shrink-0">
                                  <div className={`text-xl font-bold ${slot.status === "AVAILABLE" ? "text-emerald-600" : "text-gray-400"}`}>
                                    {slot.capacity || "∞"}
                                  </div>
                                  <div className="text-xs text-gray-400">available</div>
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
            
            {/* RIGHT: MAP (60% width or 100% in map-only mode) */}
            <div className={`relative ${viewMode === "map" ? "flex-1" : "flex-1"}`}>
              <MapView
                slots={filteredSlots}
                onSlotSelect={handleSlotSelect}
                searchLocation={selectedLocation}
                openSearchPopup={openSearchPopup}
                onSearchPopupShown={() => setOpenSearchPopup(false)}
                highlightedSlotId={highlightedSlot}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
