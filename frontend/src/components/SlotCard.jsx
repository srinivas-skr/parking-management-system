

import { motion } from "framer-motion"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { MapPin, Car, DollarSign } from "lucide-react"

function SlotCard({ slot, onBook, index = 0 }) {
  const vehicleTypeConfig = {
    TWO_WHEELER: { color: "bg-blue-500", icon: "🏍️" },
    FOUR_WHEELER: { color: "bg-emerald-500", icon: "🚗" },
    HEAVY_VEHICLE: { color: "bg-amber-500", icon: "🚛" },
  }

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
  }

  const config = statusConfig[slot.status] || statusConfig.OCCUPIED
  const vehicleType = vehicleTypeConfig[slot.vehicleType] || vehicleTypeConfig.FOUR_WHEELER

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
            <h3 className="text-2xl font-bold text-slate-900 mb-1">{slot.slotNumber}</h3>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="h-3 w-3" />
              <span>{slot.location || "Main Parking"}</span>
            </div>
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
            <div className="flex items-center gap-2 text-slate-600">
              <Car className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium">{slot.vehicleType.replace("_", " ")}</span>
            </div>
            <motion.span 
              whileHover={{ rotate: 5, scale: 1.1 }}
              className={`w-8 h-8 rounded-lg ${vehicleType.color} flex items-center justify-center text-white text-xs font-bold shadow-md`}
            >
              {vehicleType.icon}
            </motion.span>
          </div>
          <div className="flex items-baseline gap-1">
            <DollarSign className="h-5 w-5 text-purple-600" />
            <span className="text-2xl font-bold text-purple-600">{slot.pricePerHour}</span>
            <span className="text-sm text-slate-500 font-medium">/hour</span>
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
