

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { MapPin, DollarSign } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import Navbar from "../components/Navbar"
import BookingConfirmationModal from "../components/BookingConfirmationModal"
import { toast } from 'sonner'
import api from "../services/api"

export default function BookSlot() {
  const { slotId } = useParams()
  const navigate = useNavigate()
  // using sonner toast (Toaster is mounted in main.jsx)

  const [slot, setSlot] = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [formData, setFormData] = useState({
    vehicleId: "",
    checkInTime: "",
    checkOutTime: "",
  })

  useEffect(() => {
    fetchSlotAndVehicles()
  }, [slotId])

  const fetchSlotAndVehicles = async () => {
    try {
      const [slotRes, vehiclesRes] = await Promise.all([api.get(`/slots/${slotId}`), api.get("/vehicles")])
      // Backend returns data directly for slots (wrapped) but direct array for vehicles
      setSlot(slotRes.data.data || slotRes.data)
      const vehicleData = vehiclesRes.data || []
      console.log("🚗 Vehicles loaded:", vehicleData)
      setVehicles(vehicleData)
    } catch (error) {
      console.error("Failed to fetch data:", error)
      toast.error(error.response?.data?.message || "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const calculateCost = () => {
    if (!formData.checkInTime || !formData.checkOutTime || !slot) return 0

    const checkIn = new Date(formData.checkInTime)
    const checkOut = new Date(formData.checkOutTime)
    const hours = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60))

    return hours * (slot.pricePerHour || 0)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.vehicleId) {
      toast.error("Please select a vehicle")
      return
    }

    if (!formData.checkInTime || !formData.checkOutTime) {
      toast.error("Please select check-in and check-out times")
      return
    }

    // Show confirmation modal instead of direct booking
    setShowConfirmModal(true)
  }

  const handleConfirmBooking = async () => {
    try {
      setSubmitting(true)
      
      await api.post("/bookings", {
        slotId: slot.id,
        vehicleId: formData.vehicleId,
        startTime: formData.checkInTime,
        endTime: formData.checkOutTime,
      })

      toast.success("Booking created successfully", {
        description: `Slot ${slot.slotNumber || slot.id} reserved`,
      })

      setShowConfirmModal(false)
      navigate("/bookings")
    } catch (error) {
      console.error("Failed to create booking:", error)
      toast.error(error.response?.data?.message || "Failed to create booking")
    } finally {
      setSubmitting(false)
    }
  }

  const getBookingDetails = () => {
    if (!slot || !formData.vehicleId || !formData.checkInTime || !formData.checkOutTime) {
      return null
    }

    const selectedVehicle = vehicles.find(v => v.id === parseInt(formData.vehicleId))
    const checkInDate = new Date(formData.checkInTime)
    const checkOutDate = new Date(formData.checkOutTime)

    return {
      slotNumber: slot.slotNumber || `Slot ${slot.id}`,
      location: slot.location || "Main Parking Area",
      vehicleType: selectedVehicle?.vehicleType || "N/A",
      date: checkInDate.toLocaleDateString(),
      startTime: checkInDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: checkOutDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: calculateCost().toFixed(2)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!slot) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <p className="text-white">Slot not found</p>
        </div>
      </div>
    )
  }

  const totalCost = calculateCost()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      {/* Confirmation Modal */}
      <BookingConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmBooking}
        bookingDetails={getBookingDetails()}
        loading={submitting}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white">Book Parking Slot</h1>
          <p className="text-white/60">Complete your booking details</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
              <div className="p-6">
                <h2 className="mb-6 text-xl font-semibold text-white">Slot Information</h2>

                <div className="mb-8 space-y-4">
                  <div className="flex items-center gap-3 text-white/80">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-white/60">Location</p>
                      <p className="font-medium text-white">{slot.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-white/80">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-white/60">Price per Hour</p>
                      <p className="font-medium text-white">₹ {slot.pricePerHour}</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="vehicle" className="text-white/80">
                      Select Vehicle
                    </Label>
                    <select
                      id="vehicle"
                      value={formData.vehicleId}
                      onChange={(e) => {
                        console.log("🎯 Selected vehicle ID:", e.target.value)
                        setFormData({ ...formData, vehicleId: e.target.value })
                      }}
                      required
                      className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Choose a vehicle</option>
                      {vehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.vehicleNumber} ({vehicle.vehicleType})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="checkIn" className="text-white/80">
                        Check-in Time
                      </Label>
                      <input
                        id="checkIn"
                        type="datetime-local"
                        value={formData.checkInTime}
                        onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                        required
                        className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="checkOut" className="text-white/80">
                        Check-out Time
                      </Label>
                      <input
                        id="checkOut"
                        type="datetime-local"
                        value={formData.checkOutTime}
                        onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                        required
                        className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </div>
                </form>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-white/10 bg-white/5 backdrop-blur-xl">
              <div className="p-6">
                <h3 className="mb-6 text-lg font-semibold text-white">Booking Summary</h3>

                <div className="mb-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Slot</span>
                    <span className="font-medium text-white">{slot.name}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Price/Hour</span>
                    <span className="font-medium text-white">₹ {slot.pricePerHour}</span>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-white">Total</span>
                      <span className="text-2xl font-bold text-primary">₹ {totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90"
                >
                  Confirm Booking
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
