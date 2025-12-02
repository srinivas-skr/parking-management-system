import { useState, useEffect } from "react"
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

// Custom marker icons: green for free (🆓), red for paid (₹)
const createCustomIcon = (isFree, vehicleType) => {
  const free = isFree === true
  const bg = free
    ? "linear-gradient(135deg,#34d399 0%,#10b981 100%)"
    : "linear-gradient(135deg,#f87171 0%,#ef4444 100%)"
  const contentIcon = free ? "🆓" : "₹"

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background: ${bg};
        width: 44px;
        height: 44px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid rgba(255,255,255,0.85);
        box-shadow: 0 10px 18px rgba(0,0,0,0.18);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
      ">
        <span style="transform: rotate(45deg); display: block;">${contentIcon}</span>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -42],
  })
}

const youAreHereIcon = L.divIcon({
  className: "search-marker",
  html: `
    <div style="
      background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
      width: 46px;
      height: 46px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 4px solid rgba(255,255,255,0.9);
      box-shadow: 0 12px 22px rgba(14,165,233,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: white;
      font-weight: bold;
    ">
      <span style="transform: rotate(45deg); display: block;">ℹ️</span>
    </div>
  `,
  iconSize: [46, 46],
  iconAnchor: [23, 46],
  popupAnchor: [0, -44],
})

// Component to recenter map when location changes
function ChangeMapView({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 13, { animate: true })
    }
  }, [center, zoom, map])
  return null
}

export default function MapView({ slots = [], onSlotSelect, userLocation = null, searchLocation = null, openSearchPopup = false, onSearchPopupShown = null }) {
  // Default center: Bangalore (12.9716, 77.5946)
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946])
  const [showUserLocation, setShowUserLocation] = useState(false)
  const [userCoords, setUserCoords] = useState(null)
  const [mapInstance, setMapInstance] = useState(null)
  const [searchedCoords, setSearchedCoords] = useState(null)
  const [showLegend, setShowLegend] = useState(false)
  
  const formatRupees = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0))

  // AUTO-DETECT location on mount
  useEffect(() => {
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

  // Center and mark searched location
  useEffect(() => {
    if (searchLocation?.lat && searchLocation?.lng) {
      const coords = [searchLocation.lat, searchLocation.lng]
      setMapCenter(coords)
      setSearchedCoords(coords)
      setShowUserLocation(false)

      if (mapInstance) {
        mapInstance.setView(coords, 15, { animate: true })
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
        // If parent requested a callback when the popup is shown, call it
        if (typeof onSearchPopupShown === "function") {
          try {
            onSearchPopupShown()
          } catch (e) {
            console.warn("onSearchPopupShown callback threw:", e)
          }
        }
      }
    } else if (!searchLocation && searchedCoords) {
      setSearchedCoords(null)
    }
  }, [searchLocation, mapInstance, searchedCoords, openSearchPopup, onSearchPopupShown])

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
      {/* Map Controls - My Location Button */}
      <div className="absolute left-4 top-4 z-[1000]">
        <Button
          onClick={getUserLocation}
          className="bg-white/90 text-slate-900 shadow-lg backdrop-blur hover:bg-white"
        >
          <Navigation className="mr-2 h-4 w-4" />
          My Location
        </Button>
      </div>

      {/* Legend Button (Top-Right) - Google Maps Style */}
      <button 
        onClick={() => setShowLegend(!showLegend)}
        className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors"
      >
        <MapIcon className="h-4 w-4 text-slate-700" />
        <span className="text-sm font-medium text-slate-700">Legend</span>
      </button>

      {/* Legend Dropdown (Collapsible) */}
      {showLegend && (
        <div className="absolute right-4 top-16 z-[1000] w-56 bg-white rounded-xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-3 border-b pb-2">
            <h3 className="font-semibold text-sm text-slate-900">Map Legend</h3>
            <button onClick={() => setShowLegend(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500 shadow" />
              <span className="text-slate-700">Paid parking (₹)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500 shadow" />
              <span className="text-slate-700">Free parking (🆓)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="text-lg">🏍️</span>
              <span>Bike friendly</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="text-lg">🚗</span>
              <span>Car friendly</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-sky-400" />
              <span className="text-slate-700">You are here</span>
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: "100%", width: "100%", borderRadius: "12px" }}
        scrollWheelZoom={true}
        whenCreated={setMapInstance}
      >
        <ChangeMapView center={mapCenter} zoom={13} />
        
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

          return (
            <Marker
              key={slot.id}
              position={coords}
              icon={createCustomIcon(slot.isFree, slot.vehicleType)}
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

      {/* Quick Stats Overlay - Mobile: Fixed bottom, Desktop: Absolute bottom-right */}
      <div className="fixed bottom-20 right-4 md:absolute md:bottom-4 md:right-4 z-[1000]">
        <Card className="bg-white/95 p-3 shadow-lg backdrop-blur-sm">
          <div className="space-y-1 text-xs sm:text-sm">
            <div className="font-semibold text-slate-900 mb-1">Quick Stats</div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
              <span className="text-slate-700">
                {slots.filter((s) => s.status === "AVAILABLE" || s.slotStatus === "AVAILABLE").length}{" "}
                Available
              </span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
              <span className="text-slate-700">
                {slots.filter((s) => s.status === "OCCUPIED" || s.slotStatus === "OCCUPIED").length}{" "}
                Occupied
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
              <span className="text-slate-700">
                {slots.filter((s) => s.status === "RESERVED" || s.slotStatus === "RESERVED").length}{" "}
                Reserved
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
