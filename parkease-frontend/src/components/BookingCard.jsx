import { Calendar, Clock, MapPin, Car, IndianRupee } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Badge } from "./ui/badge"
import { format } from "date-fns"

const statusColors = {
  BOOKED: "bg-blue-100 text-blue-700 border-blue-200",
  ACTIVE: "bg-green-100 text-green-700 border-green-200",
  COMPLETED: "bg-gray-100 text-gray-700 border-gray-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
}

const statusGradients = {
  BOOKED: "from-blue-50 to-indigo-50",
  ACTIVE: "from-green-50 to-emerald-50",
  COMPLETED: "from-gray-50 to-slate-50",
  CANCELLED: "from-red-50 to-rose-50",
}

export default function BookingCard({ booking, onCheckIn, onCheckOut, onCancel }) {
  const canCheckIn = booking.status === "BOOKED"
  const canCheckOut = booking.status === "ACTIVE"
  const canCancel = booking.status === "BOOKED"
  
  // Handle both backend format (startTime/endTime) and demo format (checkInTime/expectedCheckOut)
  const startTime = booking.startTime || booking.checkInTime;
  const endTime = booking.endTime || booking.expectedCheckOut;
  const totalAmount = booking.totalAmount || booking.totalCost || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className={`group overflow-hidden border-2 bg-gradient-to-br ${statusGradients[booking.status] || statusGradients.BOOKED} transition-all hover:shadow-xl hover:border-purple-300`}>
        <div className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="mb-1 text-lg font-bold text-gray-900">{booking.slotNumber || booking.slot?.name || "Parking Slot"}</h3>
              <p className="text-sm font-medium text-gray-500">
                {booking.isDemo ? "🎯 Demo" : ""} Code: {booking.bookingCode || `#${booking.id}`}
              </p>
            </div>
            <Badge className={`${statusColors[booking.status] || statusColors.BOOKED} font-semibold px-3 py-1`}>
              {booking.status}
            </Badge>
          </div>

          <div className="mb-5 space-y-3 bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100">
                <MapPin className="h-4 w-4 text-purple-600" />
              </div>
              <span className="font-medium">{booking.location || booking.slot?.location || "Location not available"}</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-700">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                <Car className="h-4 w-4 text-blue-600" />
              </div>
              <span className="font-medium">
                {booking.vehicleType === 'TWO_WHEELER' ? '🏍️' : '🚗'} {booking.vehicleNumber || booking.vehicle?.vehicleNumber || "Vehicle not available"}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-700">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100">
                <Calendar className="h-4 w-4 text-indigo-600" />
              </div>
              <span className="font-medium">{startTime ? format(new Date(startTime), "MMM dd, yyyy") : "N/A"}</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-700">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-100">
                <Clock className="h-4 w-4 text-cyan-600" />
              </div>
              <span className="font-medium">
                {startTime ? format(new Date(startTime), "hh:mm a") : "N/A"} -{" "}
                {endTime ? format(new Date(endTime), "hh:mm a") : "N/A"}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-green-100 to-emerald-100">
                <IndianRupee className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-xl font-bold text-green-600">₹ {Number(totalAmount).toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {canCheckIn && (
              <Button
                onClick={() => onCheckIn(booking.id)}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Check In
              </Button>
            )}

            {canCheckOut && (
              <Button
                onClick={() => onCheckOut(booking.id)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Check Out
              </Button>
            )}

            {canCancel && (
              <Button
                onClick={() => onCancel(booking.id)}
                variant="outline"
                className="flex-1 border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 font-semibold transition-all"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
