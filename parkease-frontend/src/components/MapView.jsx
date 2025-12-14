import { useState, useEffect, useRef, memo, useCallback } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import { MapPin, Navigation, CheckCircle, XCircle, Clock, Info, Map as MapIcon, X } from "lucide-react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

// Professional marker colors (Google Maps / SpotAngels inspired)
// Green = Free parking, Blue = Paid parking, Gray = Unavailable
const createCustomIcon = (slot, isHighlighted = false) => {
  const isFree = slot?.isFree === true || Number(slot?.pricePerHour || slot?.price || 0) === 0
  const isAvailable = slot?.status === "AVAILABLE" || slot?.slotStatus === "AVAILABLE"
  const price = Number(slot?.pricePerHour || slot?.price || 0)
  
  // Professional color palette
  let bg, textColor
  if (!isAvailable) {
    // Gray for unavailable/occupied
    bg = "linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)"
    textColor = "#fff"
  } else if (isFree) {
    // Emerald green for free (softer than bright green)
    bg = "linear-gradient(135deg, #10B981 0%, #059669 100%)"
    textColor = "#fff"
  } else {
    // Professional blue for paid (not red!)
    bg = "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)"
    textColor = "#fff"
  }
  
  // Size based on highlight state
  const size = isHighlighted ? 44 : 36
  const fontSize = isHighlighted ? 13 : 11
  
  // Display price or "F" for free
  const displayText = isFree ? "F" : `₹${price}`

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background: ${bg};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid rgba(255,255,255,0.95);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        cursor: pointer;
      ">
        <span style="
          color: ${textColor};
          font-size: ${fontSize}px;
          font-weight: 700;
          letter-spacing: -0.5px;
        ">${displayText}</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4],
  })
}

const youAreHereIcon = L.divIcon({
  className: "search-marker",
  html: `
    <div style="
      position: relative;
      width: 20px;
      height: 20px;
    ">
      <!-- Pulsing ring -->
      <div style="
        position: absolute;
        top: -10px;
        left: -10px;
        width: 40px;
        height: 40px;
        background: rgba(59, 130, 246, 0.2);
        border-radius: 50%;
        animation: pulse 2s ease-in-out infinite;
      "></div>
      <!-- Center dot -->
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        width: 20px;
        height: 20px;
        background: #3B82F6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
      "></div>
    </div>
    <style>
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 0.6; }
        50% { transform: scale(1.5); opacity: 0.2; }
      }
    </style>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -15],
})

// Component to recenter map when location changes - WITH DEBOUNCE
function ChangeMapView({ center, zoom, onlyOnce = false }) {
  const map = useMap()
  const hasCenteredRef = useRef(false)
  const lastCenterRef = useRef(null)
  
  useEffect(() => {
    if (!center || center[0] == null || center[1] == null) return
    
    // Prevent repeated centering for same location
    const centerKey = `${center[0].toFixed(4)},${center[1].toFixed(4)}`
    if (lastCenterRef.current === centerKey) return
    
    // If onlyOnce mode, only center once ever
    if (onlyOnce && hasCenteredRef.current) return
    
    lastCenterRef.current = centerKey
    hasCenteredRef.current = true
    
    // Use flyTo for smoother transition, disable animation if causing issues
    map.setView(center, zoom || 13, { animate: false })
  }, [center, zoom, map, onlyOnce])
  
  return null
}

export default function MapView({ slots = [], onSlotSelect, userLocation = null, searchLocation = null, openSearchPopup = false, onSearchPopupShown = null, highlightedSlotId = null }) {
  // Default center: Bangalore (12.9716, 77.5946)
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946])
  const [showUserLocation, setShowUserLocation] = useState(false)
  const [userCoords, setUserCoords] = useState(null)
  const [mapInstance, setMapInstance] = useState(null)
  const [searchedCoords, setSearchedCoords] = useState(null)
  const [showLegend, setShowLegend] = useState(false)
  
  // ✅ ANTI-AUTO-ZOOM: Refs to prevent repeated operations
  const hasAutoLocatedRef = useRef(false)
  const lastSearchLocationRef = useRef(null)
  const popupShownForRef = useRef(null)
  const lastFitBoundsRef = useRef(null)
  
  const formatRupees = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0))

  // AUTO-DETECT location on mount - ONLY ONCE
  useEffect(() => {
    // ✅ Prevent multiple auto-locate calls
    if (hasAutoLocatedRef.current) return
    hasAutoLocatedRef.current = true
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setMapCenter([latitude, longitude])
          setUserCoords([latitude, longitude])
          setShowUserLocation(true)
          setSearchedCoords(null)
        },
        (error) => {
          console.log("Location denied, using Bangalore center")
        }
      )
    }
  }, [])

  // Manual location refresh
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setMapCenter([latitude, longitude])
          setUserCoords([latitude, longitude])
          setShowUserLocation(true)
          setSearchedCoords(null)
        },
        (error) => {
          console.error("Error getting user location:", error)
        }
      )
    }
  }

  // Center and mark searched location - WITH ANTI-REPEAT PROTECTION
  useEffect(() => {
    if (searchLocation?.lat && searchLocation?.lng) {
      // ✅ Check if this is the same location we already handled
      const locationKey = `${searchLocation.lat.toFixed(4)},${searchLocation.lng.toFixed(4)}`
      if (lastSearchLocationRef.current === locationKey) return
      lastSearchLocationRef.current = locationKey
      
      const coords = [searchLocation.lat, searchLocation.lng]
      setMapCenter(coords)
      setSearchedCoords(coords)
      setShowUserLocation(false)

      if (mapInstance) {
        // ✅ Disable animation to prevent zoom flicker
        mapInstance.setView(coords, 15, { animate: false })
        
        // ✅ Only show popup once per location
        if (popupShownForRef.current !== locationKey) {
          popupShownForRef.current = locationKey
          
          L.popup({
            closeButton: false,
            autoClose: true,
            className: "you-are-here-popup",
          })
            .setLatLng(coords)
            .setContent(`
              <div style="display:flex;align-items:center;gap:8px;font-weight:600;color:#0f172a;">
                <span style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:rgba(14,165,233,0.1);color:#0ea5e9;">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="8"/></svg>
                </span>
                You are here
              </div>
            `)
            .openOn(mapInstance)
          
          // Callback to parent
          if (typeof onSearchPopupShown === "function") {
            try {
              onSearchPopupShown()
            } catch (e) {
              console.warn("onSearchPopupShown callback threw:", e)
            }
          }
        }
      }
    } else if (!searchLocation && searchedCoords) {
      setSearchedCoords(null)
      lastSearchLocationRef.current = null
      popupShownForRef.current = null
    }
  }, [searchLocation, mapInstance]) // ✅ Removed searchedCoords, openSearchPopup from deps to prevent loops

  // ✅ FIT BOUNDS TO SHOW ALL SLOT MARKERS when area is selected
  useEffect(() => {
    if (!mapInstance || slots.length === 0) return
    
    // Get valid slot coordinates
    const validSlots = slots.filter(s => s.latitude && s.longitude)
    if (validSlots.length === 0) return
    
    // Create a unique key using all slot IDs to detect changes
    const slotIds = validSlots.map(s => s.id).sort().join(',')
    const boundsKey = `${searchLocation?.name || 'all'}-${slotIds}`
    
    // Skip if we've already fit to these exact slots
    if (lastFitBoundsRef.current === boundsKey) return
    lastFitBoundsRef.current = boundsKey
    
    console.log(`🗺️ Fitting bounds for ${validSlots.length} slots in "${searchLocation?.name || 'all areas'}"`)
    
    // Calculate bounds from all slot coordinates
    const lats = validSlots.map(s => parseFloat(s.latitude))
    const lngs = validSlots.map(s => parseFloat(s.longitude))
    
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)
    
    // Add padding based on number of slots
    const padding = validSlots.length === 1 ? 0.01 : 0.003
    const bounds = [
      [minLat - padding, minLng - padding],
      [maxLat + padding, maxLng + padding]
    ]
    
    // Fit map to show all markers with animation
    setTimeout(() => {
      try {
        mapInstance.fitBounds(bounds, { 
          padding: [60, 60],
          maxZoom: validSlots.length === 1 ? 17 : 15, // Closer zoom for single slot
          animate: true,
          duration: 0.5
        })
        console.log(`✅ Map fitted to show ${validSlots.length} markers`)
      } catch (e) {
        console.log("Fit bounds error:", e)
      }
    }, 150)
    
  }, [slots, searchLocation, mapInstance])

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return (R * c).toFixed(2)
  }

  // Get slot coordinates (convert BigDecimal to number)
  const getSlotCoordinates = (slot) => {
    const lat = parseFloat(slot.latitude)
    const lng = parseFloat(slot.longitude)
    return [lat, lng]
  }

  const handleMarkerClick = (slot) => {
    const coords = getSlotCoordinates(slot)
    setMapCenter(coords)
  }

  const handleBookNow = (slot) => {
    if (onSlotSelect) {
      onSlotSelect(slot)
    }
  }

  return (
    <div className="relative h-full w-full">
      {/* Top controls removed - moved to floating bottom-right */}

      {/* Legend Button (Top-Right) - Google Maps Style */}
      <button 
        onClick={() => setShowLegend(!showLegend)}
        className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors"
      >
        <MapIcon className="h-4 w-4 text-slate-700" />
        <span className="text-sm font-medium text-slate-700">Legend</span>
      </button>

      {/* Legend Dropdown (Collapsible) - Updated with new colors */}
      {showLegend && (
        <div className="absolute right-4 top-16 z-[1000] w-52 bg-white rounded-xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-3 border-b pb-2">
            <h3 className="font-semibold text-sm text-slate-900">Parking Types</h3>
            <button onClick={() => setShowLegend(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-white font-bold shadow">F</div>
              <span className="text-slate-700">Free Parking</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[9px] text-white font-bold shadow">₹</div>
              <span className="text-slate-700">Paid Parking</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-[10px] text-white font-bold shadow">−</div>
              <span className="text-slate-700">No Spots Available</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-md"></div>
              <span className="text-slate-700">Your Location</span>
            </div>
          </div>
          <button
            onClick={() => setShowLegend(false)}
            className="mt-4 w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      )}

      {/* Map Container - WITH ANTI-AUTO-ZOOM SETTINGS */}
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: "100%", width: "100%", borderRadius: "12px" }}
        scrollWheelZoom={true}
        doubleClickZoom={false}  // ✅ Disable double-click zoom (common cause of auto-zoom)
        zoomAnimation={false}    // ✅ Disable zoom animations to prevent flicker
        markerZoomAnimation={false}  // ✅ Disable marker zoom animation
        ref={(map) => { 
          if (map && !mapInstance) {
            setMapInstance(map)
            // ✅ Stop any auto-zoom behaviors
            map.options.zoomAnimation = false
            map.options.markerZoomAnimation = false
          }
        }}
      >
        <ChangeMapView center={mapCenter} zoom={13} onlyOnce={true} />
        
        {/* OpenStreetMap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Searched Location Marker */}
        {searchedCoords && (
          <Marker position={searchedCoords} icon={youAreHereIcon}>
            <Popup>
              <div className="flex items-center gap-2 text-slate-800 font-semibold">
                <Info className="h-4 w-4 text-sky-500" />
                You are here
              </div>
            </Popup>
          </Marker>
        )}

        {/* User Location Marker */}
        {showUserLocation && userCoords && (
          <Marker position={userCoords} icon={youAreHereIcon}>
            <Popup>
              <div className="flex items-center gap-2 text-slate-800 font-semibold">
                <Info className="h-4 w-4 text-sky-500" />
                You are here
              </div>
            </Popup>
          </Marker>
        )}

        {/* Parking Slot Markers */}
        {slots.map((slot) => {
          if (!slot.latitude || !slot.longitude) return null

          const coords = getSlotCoordinates(slot)
          const distance = userCoords
            ? calculateDistance(userCoords[0], userCoords[1], coords[0], coords[1])
            : null
          const isHighlighted = highlightedSlotId === slot.id

          return (
            <Marker
              key={slot.id}
              position={coords}
              icon={createCustomIcon(slot, isHighlighted)}
              eventHandlers={{
                click: () => handleMarkerClick(slot),
              }}
            >
              <Popup className="custom-popup" maxWidth={300}>
                <div className="space-y-3 p-2">
                  {/* Slot Header */}
                  <div className="border-b border-gray-200 pb-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900">
                        {slot.name || slot.slotNumber || `Slot ${slot.id}`}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          slot.status === "AVAILABLE" || slot.slotStatus === "AVAILABLE"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {slot.status || slot.slotStatus}
                      </span>
                    </div>
                  </div>

                  {/* Slot Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{slot.location || slot.locationDescription}</span>
                    </div>

                    {distance && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Navigation className="h-4 w-4 text-purple-500" />
                        <span>{distance} km away</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="font-semibold text-green-600">
                        {formatRupees(slot.pricePerHour)} / hour
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="text-lg">
                        {(slot.vehicleType === "TWO_WHEELER" || slot.vehicleType === "Bike") ? "🏍️" : "🚗"}
                      </span>
                      <span>{(slot.vehicleType === "TWO_WHEELER" || slot.vehicleType === "Bike") ? "Bike" : "Car"}</span>
                    </div>

                    {slot.availableSpots !== undefined && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span>{slot.availableSpots} spots free</span>
                      </div>
                    )}

                    {slot.floorNumber !== undefined && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <span>📍 Floor {slot.floorNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* Book Now Button */}
                  {(slot.status === "AVAILABLE" || slot.slotStatus === "AVAILABLE") && (
                    <Button
                      onClick={() => handleBookNow(slot)}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Book This Slot
                    </Button>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* Floating Zoom Controls - Bottom Right (Google Maps style) */}
      <div className="absolute bottom-24 right-4 z-[1000] flex flex-col gap-2">
        {/* My Location Button - Floating */}
        <button
          onClick={getUserLocation}
          className="w-10 h-10 bg-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
          title="My Location"
        >
          <Navigation className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
        </button>
      </div>
    </div>
  )
}
