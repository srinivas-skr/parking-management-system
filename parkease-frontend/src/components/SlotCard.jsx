import { motion } from "framer-motion"
import { Button } from "./ui/button"
import { MapPin } from "lucide-react"
import { FaMotorcycle, FaCar } from "react-icons/fa"

const vehicleTypeConfig = {
  TWO_WHEELER: {
    label: "Bike",
    bubbleClass: "bg-blue-100 text-blue-600",
    Icon: FaMotorcycle,
  },
  FOUR_WHEELER: {
    label: "Car",
    bubbleClass: "bg-green-100 text-green-600",
    Icon: FaCar,
  },
  // Accept frontend-friendly labels as well
  Bike: {
    label: "Bike",
    bubbleClass: "bg-blue-100 text-blue-600",
    Icon: FaMotorcycle,
  },
  Car: {
    label: "Car",
    bubbleClass: "bg-green-100 text-green-600",
    Icon: FaCar,
  },
}

function SlotCard({ slot, onBook, index = 0 }) {
  const isFree = slot.isFree === true || Number(slot.pricePerHour || slot.price || 0) === 0
  
  const statusConfig = {
    AVAILABLE: {
      dotColor: "bg-emerald-500",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      buttonClass: "bg-purple-600 hover:bg-purple-700 text-white shadow-md",
      buttonText: "Book Now",
      disabled: false
    },
    OCCUPIED: {
      dotColor: "bg-red-500",
      bgColor: "bg-slate-50",
      borderColor: "border-slate-200",
      buttonClass: "bg-slate-200 text-slate-400 cursor-not-allowed",
      buttonText: "Not Available",
      disabled: true
    },
    RESERVED: {
      dotColor: "bg-amber-500",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      buttonClass: "bg-slate-200 text-slate-400 cursor-not-allowed",
      buttonText: "Reserved",
      disabled: true
    },
    MAINTENANCE: {
      dotColor: "bg-slate-500",
      bgColor: "bg-slate-50",
      borderColor: "border-slate-300",
      buttonClass: "bg-slate-200 text-slate-400 cursor-not-allowed",
      buttonText: "Unavailable",
      disabled: true
    },
  }

  const config = statusConfig[slot.status] || statusConfig[slot.slotStatus] || statusConfig.OCCUPIED
  const vehicleType = vehicleTypeConfig[slot.vehicleType] || vehicleTypeConfig.FOUR_WHEELER
  const VehicleIcon = vehicleType?.Icon || FaCar
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(slot.pricePerHour || 0))
  const displayName = slot.location || slot.locationDescription || slot.name || slot.slotNumber

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.2, ease: "easeOut" } 
      }}
      className={`relative bg-white/80 backdrop-blur-sm border-2 ${config.borderColor} rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden`}
    >
      {/* Gradient overlay on hover */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-2xl font-bold text-slate-900">{displayName}</h3>
              {/* Free/Paid Badge */}
              {isFree ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold shadow-sm">
                  FREE
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-bold shadow-sm">
                  PAID
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="h-3 w-3" />
              <span>{slot.location || slot.locationDescription || "Bengaluru"}</span>
            </div>
            {slot.distance != null && (
              <div className="mt-1 text-xs font-semibold text-purple-600">
                📍 {Number(slot.distance).toFixed(1)} km away
              </div>
            )}
          </div>
          <motion.span 
            className={`w-3 h-3 rounded-full ${config.dotColor}`}
            animate={{ 
              scale: slot.status === "AVAILABLE" ? [1, 1.2, 1] : 1,
              opacity: slot.status === "AVAILABLE" ? [1, 0.5, 1] : 0.6
            }}
            transition={{ 
              duration: 2, 
              repeat: slot.status === "AVAILABLE" ? Infinity : 0 
            }}
          />
        </div>

        <div className="space-y-3 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-600">
              <div className={`flex items-center justify-center rounded-full p-3 text-3xl shadow-lg ${vehicleType.bubbleClass}`}>
                <VehicleIcon />
              </div>
              <span className="text-sm font-semibold text-slate-700">
                {vehicleType.label}
              </span>
            </div>
            <div className="text-xs font-semibold text-purple-600">
              {slot.availableSpots !== undefined ? `${slot.availableSpots} spots free` : null}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-600">{formattedPrice}</span>
            <span className="text-sm text-slate-500 font-medium">per hour</span>
          </div>
        </div>

        <motion.div
          whileHover={!config.disabled ? { scale: 1.02 } : {}}
          whileTap={!config.disabled ? { scale: 0.98 } : {}}
        >
          <Button 
            onClick={onBook} 
            disabled={config.disabled} 
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
              config.disabled 
                ? config.buttonClass 
                : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            <span className="relative z-10">{config.buttonText}</span>
            {!config.disabled && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity"
              />
            )}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default SlotCard
