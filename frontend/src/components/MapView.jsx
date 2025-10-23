import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import { MapPin, Navigation, DollarSign, CheckCircle, XCircle, Clock } from "lucide-react"
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

// Custom marker icons based on slot status
const createCustomIcon = (status, vehicleType) => {
  const getColor = () => {
    switch (status) {
      case "AVAILABLE":
        return "#10b981" // Green
      case "OCCUPIED":
        return "#ef4444" // Red
      case "RESERVED":
        return "#f59e0b" // Orange
      case "MAINTENANCE":
        return "#6b7280" // Gray
      default:
        return "#3b82f6" // Blue
    }
  }

  const getIcon = () => {
    switch (vehicleType) {
      case "TWO_WHEELER":
        return "🏍️"
      case "FOUR_WHEELER":
        return "🚗"
      case "HEAVY_VEHICLE":
        return "🚛"
      default:
        return "🚗"
    }
  }

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background-color: ${getColor()};
        width: 40px;
        height: 40px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
      ">
        <span style="transform: rotate(45deg); display: block;">${getIcon()}</span>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  })
}

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

export default function MapView({ slots = [], onSlotSelect, userLocation = null }) {
  // Default center: Bangalore (12.9716, 77.5946)
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [showUserLocation, setShowUserLocation] = useState(false)

  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setMapCenter([latitude, longitude])
          setShowUserLocation(true)
        },
        (error) => {
          console.error("Error getting user location:", error)
        }
      )
    }
  }

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
    setSelectedSlot(slot)
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
      {/* Map Controls */}
      <div className="absolute left-4 top-4 z-[1000] space-y-2">
        <Button
          onClick={getUserLocation}
          className="bg-white/90 text-slate-900 shadow-lg backdrop-blur hover:bg-white"
        >
          <Navigation className="mr-2 h-4 w-4" />
          My Location
        </Button>

        {/* Legend */}
        <Card className="bg-white/90 p-3 shadow-lg backdrop-blur">
          <div className="space-y-2 text-sm">
            <div className="font-semibold text-slate-900">Legend</div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-slate-700">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-slate-700">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-orange-500" />
              <span className="text-slate-700">Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gray-500" />
              <span className="text-slate-700">Maintenance</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: "100%", width: "100%", borderRadius: "12px" }}
        scrollWheelZoom={true}
      >
        <ChangeMapView center={mapCenter} zoom={13} />
        
        {/* OpenStreetMap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Marker */}
        {showUserLocation && (
          <Marker position={mapCenter}>
            <Popup>
              <div className="text-center">
                <div className="text-lg font-bold">📍 You are here</div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Parking Slot Markers */}
        {slots.map((slot) => {
          if (!slot.latitude || !slot.longitude) return null

          const coords = getSlotCoordinates(slot)
          const distance = showUserLocation
            ? calculateDistance(mapCenter[0], mapCenter[1], coords[0], coords[1])
            : null

          return (
            <Marker
              key={slot.id}
              position={coords}
              icon={createCustomIcon(slot.status || slot.slotStatus, slot.vehicleType)}
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
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="font-semibold text-green-600">
                        ${slot.pricePerHour || 0}/hour
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="text-lg">
                        {slot.vehicleType === "TWO_WHEELER" && "🏍️"}
                        {slot.vehicleType === "FOUR_WHEELER" && "🚗"}
                        {slot.vehicleType === "HEAVY_VEHICLE" && "🚛"}
                      </span>
                      <span>{slot.vehicleType?.replace("_", " ")}</span>
                    </div>

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

      {/* Stats Overlay */}
      <div className="absolute bottom-4 right-4 z-[1000]">
        <Card className="bg-white/90 p-4 shadow-lg backdrop-blur">
          <div className="space-y-2 text-sm">
            <div className="font-semibold text-slate-900">Quick Stats</div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-slate-700">
                {slots.filter((s) => s.status === "AVAILABLE" || s.slotStatus === "AVAILABLE").length}{" "}
                Available
              </span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-slate-700">
                {slots.filter((s) => s.status === "OCCUPIED" || s.slotStatus === "OCCUPIED").length}{" "}
                Occupied
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
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
