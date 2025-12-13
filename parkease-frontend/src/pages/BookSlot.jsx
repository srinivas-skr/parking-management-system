

import { useState, useEffect } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { MapPin, DollarSign, Clock, Car, Bike, Plus, Calendar, Zap } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { Label } from "../components/ui/label"
import Navbar from "../components/Navbar"
import BookingConfirmationModal from "../components/BookingConfirmationModal"
import { toast } from 'sonner'
import api from "../services/api"
import { getRealtimeParkingData } from "../data/osmParkingData"

// Helper to get/save demo bookings from localStorage
const getDemoBookings = () => {
  try {
    return JSON.parse(localStorage.getItem('demoBookings') || '[]');
  } catch {
    return [];
  }
};

const saveDemoBooking = (booking) => {
  const bookings = getDemoBookings();
  bookings.push(booking);
  localStorage.setItem('demoBookings', JSON.stringify(bookings));
};

// Check if vehicle already has an active booking (BOOKED, ACTIVE, CONFIRMED)
const isVehicleAlreadyBooked = (vehicleNumber) => {
  const demoBookings = getDemoBookings();
  const activeStatuses = ['BOOKED', 'ACTIVE', 'CONFIRMED', 'booked', 'active', 'confirmed'];
  
  return demoBookings.some(booking => {
    const bookingVehicle = booking.vehicleNumber?.toUpperCase();
    const checkVehicle = vehicleNumber?.toUpperCase();
    const isActive = activeStatuses.includes(booking.status);
    
    // Check if booking is still valid (not expired)
    const endTime = new Date(booking.expectedCheckOut || booking.endTime);
    const isNotExpired = endTime > new Date();
    
    return bookingVehicle === checkVehicle && isActive && isNotExpired;
  });
};

// Get the active booking for a vehicle (if any)
const getActiveBookingForVehicle = (vehicleNumber) => {
  const demoBookings = getDemoBookings();
  const activeStatuses = ['BOOKED', 'ACTIVE', 'CONFIRMED', 'booked', 'active', 'confirmed'];
  
  return demoBookings.find(booking => {
    const bookingVehicle = booking.vehicleNumber?.toUpperCase();
    const checkVehicle = vehicleNumber?.toUpperCase();
    const isActive = activeStatuses.includes(booking.status);
    const endTime = new Date(booking.expectedCheckOut || booking.endTime);
    const isNotExpired = endTime > new Date();
    
    return bookingVehicle === checkVehicle && isActive && isNotExpired;
  });
};

// Demo vehicles for when API returns empty - include both types
const DEMO_VEHICLES = [
  { id: 1, vehicleNumber: "KA-01-AB-1234", vehicleType: "FOUR_WHEELER", brand: "Honda City" },
  { id: 2, vehicleNumber: "KA-05-CD-5678", vehicleType: "TWO_WHEELER", brand: "Honda Activa" },
  { id: 3, vehicleNumber: "KA-03-EF-9012", vehicleType: "FOUR_WHEELER", brand: "Maruti Swift" },
  { id: 4, vehicleNumber: "KA-02-GH-3456", vehicleType: "TWO_WHEELER", brand: "TVS Jupiter" },
]

// Quick duration options (popular choices)
const DURATION_OPTIONS = [
  { hours: 1, label: "1 Hour", popular: false },
  { hours: 2, label: "2 Hours", popular: true },
  { hours: 3, label: "3 Hours", popular: false },
  { hours: 4, label: "4 Hours", popular: false },
  { hours: 6, label: "6 Hours", popular: false },
  { hours: 12, label: "Half Day", popular: false },
  { hours: 24, label: "Full Day", popular: true },
]

export default function BookSlot() {
  const { slotId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [slot, setSlot] = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState(2) // Default 2 hours
  const [startOption, setStartOption] = useState("now") // "now" or "later"
  const [customDate, setCustomDate] = useState("")
  const [customTime, setCustomTime] = useState("")
  const [formData, setFormData] = useState({
    vehicleId: "",
    checkInTime: "",
    checkOutTime: "",
  })

  // Auto-select vehicle from URL params (passed from Dashboard)
  const autoSelectVehicle = (vehicleList) => {
    const urlVehicleNumber = searchParams.get("vehicleNumber")
    if (urlVehicleNumber) {
      const matchingVehicle = vehicleList.find(v => 
        v.vehicleNumber?.toUpperCase() === urlVehicleNumber.toUpperCase()
      )
      if (matchingVehicle) {
        console.log("🚗 Auto-selecting vehicle from URL:", matchingVehicle.vehicleNumber)
        setFormData(prev => ({ ...prev, vehicleId: String(matchingVehicle.id) }))
      }
    }
  }

  useEffect(() => {
    fetchSlotAndVehicles()
  }, [slotId])

  // Update check-in/out times when duration or start option changes
  useEffect(() => {
    updateBookingTimes()
  }, [selectedDuration, startOption, customDate, customTime])

  const fetchSlotAndVehicles = async () => {
    try {
      // First try to get slot from backend API
      let slotData = null;
      
      try {
        const slotRes = await api.get(`/slots/${slotId}`);
        slotData = slotRes.data.data || slotRes.data;
      } catch (slotError) {
        console.log("Backend slot not found, checking OSM demo data...");
        // Fallback to OSM demo data if backend doesn't have the slot
        const osmData = getRealtimeParkingData();
        slotData = osmData.find(s => String(s.id) === String(slotId));
        
        if (!slotData) {
          toast.error("Slot not found");
          navigate('/slots', { replace: true });
          return;
        }
      }
      
      // Check if slot is available before allowing booking
      if (slotData.slotStatus !== 'AVAILABLE' && slotData.status !== 'AVAILABLE') {
        toast.error("This parking slot is no longer available")
        navigate('/slots', { replace: true })
        return
      }
      
      setSlot(slotData)
      
      // Try to fetch user's vehicles
      let vehicleData = [];
      try {
        const vehiclesRes = await api.get("/vehicles");
        vehicleData = vehiclesRes.data || [];
      } catch (vehicleError) {
        console.log("Failed to fetch vehicles, using demo vehicles");
      }
      
      console.log("🚗 Vehicles loaded:", vehicleData)
      
      // Use demo vehicles if none returned
      if (vehicleData.length === 0) {
        console.log("📌 Using demo vehicles")
        setVehicles(DEMO_VEHICLES)
        // Auto-select vehicle from URL params
        autoSelectVehicle(DEMO_VEHICLES)
      } else {
        setVehicles(vehicleData)
        // Auto-select vehicle from URL params
        autoSelectVehicle(vehicleData)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
      // Use demo vehicles on error
      setVehicles(DEMO_VEHICLES)
      toast.error(error.response?.data?.message || "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const updateBookingTimes = () => {
    let checkIn
    
    if (startOption === "now") {
      checkIn = new Date()
      // Round to next 15 minutes
      checkIn.setMinutes(Math.ceil(checkIn.getMinutes() / 15) * 15, 0, 0)
    } else if (customDate && customTime) {
      checkIn = new Date(`${customDate}T${customTime}`)
    } else {
      return
    }

    const checkOut = new Date(checkIn.getTime() + selectedDuration * 60 * 60 * 1000)
    
    setFormData({
      ...formData,
      checkInTime: checkIn.toISOString().slice(0, 16),
      checkOutTime: checkOut.toISOString().slice(0, 16),
    })
  }

  const calculateCost = () => {
    if (!slot) return 0
    return selectedDuration * (slot.pricePerHour || 0)
  }

  const handleSubmit = (e) => {
    e?.preventDefault()

    if (!formData.vehicleId) {
      toast.error("Please select a vehicle")
      return
    }

    if (!formData.checkInTime || !formData.checkOutTime) {
      toast.error("Please select booking time")
      return
    }
    
    // CHECK: Is vehicle already booked?
    const selectedVehicle = vehicles.find(v => v.id === parseInt(formData.vehicleId));
    if (selectedVehicle && isVehicleAlreadyBooked(selectedVehicle.vehicleNumber)) {
      const existingBooking = getActiveBookingForVehicle(selectedVehicle.vehicleNumber);
      toast.error(`Vehicle ${selectedVehicle.vehicleNumber} is already booked!`, {
        description: existingBooking 
          ? `Active booking at ${existingBooking.location || existingBooking.slotNumber}` 
          : "Please check out first before making a new booking."
      });
      return;
    }

    setShowConfirmModal(true)
  }

  const handleConfirmBooking = async () => {
    try {
      setSubmitting(true)
      
      // Check if this is a demo slot (from OSM data) or a real backend slot
      const isDemoSlot = slot.dataSource === 'OpenStreetMap';
      const selectedVehicle = vehicles.find(v => v.id === parseInt(formData.vehicleId));
      
      // DOUBLE-CHECK: Vehicle not already booked (in case of race condition)
      if (selectedVehicle && isVehicleAlreadyBooked(selectedVehicle.vehicleNumber)) {
        toast.error(`Vehicle ${selectedVehicle.vehicleNumber} is already booked!`, {
          description: "Cannot create duplicate booking. Please check out first."
        });
        setShowConfirmModal(false);
        setSubmitting(false);
        return;
      }
      
      if (isDemoSlot) {
        // For demo slots, save to localStorage and simulate successful booking
        console.log("📌 Demo booking for OSM slot:", slot.id);
        
        const cost = calculateCost();
        
        // Build proper location string from available data
        const locationString = slot.address || slot.location || slot.areaName || 
          (slot.name ? slot.name.split(' - ')[0] : 'Bengaluru');
        
        // Create demo booking object with ALL field names for compatibility
        const demoBooking = {
          id: Date.now(), // Unique ID
          bookingCode: `DEMO-${Date.now().toString(36).toUpperCase()}`,
          slotId: slot.id,
          slotNumber: slot.slotNumber || slot.name,
          location: locationString,
          areaName: slot.areaName || locationString,
          vehicleNumber: selectedVehicle?.vehicleNumber || 'N/A',
          vehicleType: slot.vehicleType,
          // Include BOTH field name formats for BookingCard compatibility
          checkInTime: formData.checkInTime,
          expectedCheckOut: formData.checkOutTime,
          startTime: formData.checkInTime,   // Alias for BookingCard
          endTime: formData.checkOutTime,    // Alias for BookingCard
          totalCost: cost,
          totalAmount: cost,                  // Alias for BookingCard
          status: 'BOOKED',
          createdAt: new Date().toISOString(),
          isDemo: true
        };
        
        // Save to localStorage
        saveDemoBooking(demoBooking);
        
        // Simulate a brief delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        toast.success("Booking created successfully! 🎉", {
          description: `Slot ${slot.slotNumber || slot.name} reserved for ${selectedDuration} hours`,
        });
        
        setShowConfirmModal(false);
        navigate("/bookings");
        return;
      }
      
      // For real backend slots, double-check availability
      try {
        const slotCheckRes = await api.get(`/slots/${slotId}`)
        const currentSlot = slotCheckRes.data.data || slotCheckRes.data
        
        // Backend uses "status" field, not "slotStatus"
        const slotStatus = currentSlot.status || currentSlot.slotStatus
        if (slotStatus !== 'AVAILABLE') {
          toast.error("Sorry! This slot was just booked by someone else.")
          setShowConfirmModal(false)
          navigate('/slots', { replace: true })
          return
        }
      } catch (checkError) {
        // If check fails, treat as demo booking (save to localStorage)
        console.log("Backend slot check failed, treating as demo booking:", checkError)
        
        const cost = calculateCost();
        const locationString = slot.address || slot.location || slot.areaName || 
          (slot.name ? slot.name.split(' - ')[0] : 'Bengaluru');
        
        const demoBooking = {
          id: Date.now(),
          bookingCode: `BK-${Date.now().toString(36).toUpperCase()}`,
          slotId: slot.id,
          slotNumber: slot.slotNumber || slot.name,
          location: locationString,
          areaName: slot.areaName || locationString,
          vehicleNumber: selectedVehicle?.vehicleNumber || 'N/A',
          vehicleType: slot.vehicleType,
          checkInTime: formData.checkInTime,
          expectedCheckOut: formData.checkOutTime,
          startTime: formData.checkInTime,
          endTime: formData.checkOutTime,
          totalCost: cost,
          totalAmount: cost,
          status: 'BOOKED',
          createdAt: new Date().toISOString(),
          isDemo: true
        };
        
        saveDemoBooking(demoBooking);
        toast.success("Booking created successfully! 🎉", {
          description: `Slot ${slot.slotNumber || slot.name} reserved for ${selectedDuration} hours`,
        });
        setShowConfirmModal(false);
        navigate("/bookings");
        return;
      }
      
      await api.post("/bookings", {
        slotId: slot.id,
        vehicleId: parseInt(formData.vehicleId),
        expectedCheckOut: formData.checkOutTime,
      })

      toast.success("Booking created successfully! 🎉", {
        description: `Slot ${slot.slotNumber || slot.id} reserved for ${selectedDuration} hours`,
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

  // Format time for display
  const formatTimeDisplay = (isoString) => {
    if (!isoString) return "--:--"
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  const formatDateDisplay = (isoString) => {
    if (!isoString) return "Select date"
    const date = new Date(isoString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) return "Today"
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow"
    return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-100">
        <Navbar />
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!slot) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-100">
        <Navbar />
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <p className="text-gray-800">Slot not found</p>
        </div>
      </div>
    )
  }

  const totalCost = calculateCost()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-100">
      <Navbar />
      
      <BookingConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmBooking}
        bookingDetails={getBookingDetails()}
        loading={submitting}
      />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-gray-900">Book Parking Slot</h1>
          <p className="text-gray-600 text-sm sm:text-base">Complete your booking details</p>
        </div>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Slot Information Card */}
            <Card className="border-purple-100 bg-white shadow-lg">
              <div className="p-4 sm:p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">📍 Slot Information</h2>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="font-medium text-gray-900">{slot.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="font-medium text-gray-900">₹{slot.pricePerHour}/hour</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Vehicle Selection - Improved with Type Matching */}
            <Card className="border-purple-100 bg-white shadow-lg">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">🚗 Select Vehicle</h2>
                  <button 
                    onClick={() => navigate('/my-vehicles')}
                    className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Add New
                  </button>
                </div>
                
                {/* Show slot vehicle type requirement */}
                <div className={`mb-4 p-3 rounded-lg border ${
                  slot.vehicleType === "TWO_WHEELER" 
                    ? "bg-green-50 border-green-300" 
                    : "bg-blue-50 border-blue-300"
                }`}>
                  <p className="text-sm text-gray-700">
                    <span className="text-lg mr-2">{slot.vehicleType === "TWO_WHEELER" ? "🏍️" : "🚗"}</span>
                    This slot is for <span className="font-bold text-gray-900">{slot.vehicleType === "TWO_WHEELER" ? "Two Wheelers (Bike/Scooter)" : "Four Wheelers (Car/SUV)"}</span>
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {vehicles.filter(vehicle => {
                    // Filter vehicles by slot type to prevent mismatch
                    const vType = vehicle.vehicleType?.toUpperCase() || ""
                    const slotType = slot.vehicleType?.toUpperCase() || ""
                    
                    if (slotType === "TWO_WHEELER") {
                      return vType === "TWO_WHEELER" || vType === "BIKE" || vType.includes("BIKE") || vType.includes("SCOOTER")
                    } else if (slotType === "FOUR_WHEELER") {
                      return vType === "FOUR_WHEELER" || vType === "CAR" || vType.includes("CAR") || vType.includes("SUV")
                    }
                    return true
                  }).map((vehicle) => (
                    <button
                      key={vehicle.id}
                      onClick={() => setFormData({ ...formData, vehicleId: String(vehicle.id) })}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                        formData.vehicleId === String(vehicle.id)
                          ? "border-purple-500 bg-purple-100 ring-2 ring-purple-300"
                          : "border-gray-200 bg-gray-50 hover:border-purple-300 hover:bg-purple-50"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        formData.vehicleId === String(vehicle.id) ? "bg-purple-500" : "bg-purple-100"
                      }`}>
                        {vehicle.vehicleType === "Bike" || vehicle.vehicleType === "TWO_WHEELER" ? (
                          <Bike className={`h-6 w-6 ${formData.vehicleId === String(vehicle.id) ? "text-white" : "text-purple-600"}`} />
                        ) : (
                          <Car className={`h-6 w-6 ${formData.vehicleId === String(vehicle.id) ? "text-white" : "text-purple-600"}`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{vehicle.vehicleNumber}</p>
                        <p className="text-sm text-gray-500">{vehicle.brand || vehicle.vehicleType}</p>
                      </div>
                      {formData.vehicleId === String(vehicle.id) && (
                        <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center shadow-lg">
                          <span className="text-white text-sm font-bold">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Time Selection - User Friendly */}
            <Card className="border-purple-100 bg-white shadow-lg">
              <div className="p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">⏰ When do you want to park?</h2>
                
                {/* Start Now or Later Toggle */}
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => setStartOption("now")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
                      startOption === "now"
                        ? "border-green-500 bg-green-100 text-green-700"
                        : "border-gray-200 bg-gray-50 text-gray-600 hover:border-green-300"
                    }`}
                  >
                    <Zap className="h-5 w-5" />
                    <span className="font-semibold">Start Now</span>
                  </button>
                  <button
                    onClick={() => setStartOption("later")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
                      startOption === "later"
                        ? "border-blue-500 bg-blue-100 text-blue-700"
                        : "border-gray-200 bg-gray-50 text-gray-600 hover:border-blue-300"
                    }`}
                  >
                    <Calendar className="h-5 w-5" />
                    <span className="font-semibold">Schedule Later</span>
                  </button>
                </div>

                {/* Custom Date/Time for "Later" option */}
                {startOption === "later" && (
                  <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Date</label>
                      <input
                        type="date"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Time</label>
                      <input
                        type="time"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Duration Selection - Quick Buttons with Visible Checkmark */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-3">How long do you need?</label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {DURATION_OPTIONS.map((option) => (
                      <button
                        key={option.hours}
                        onClick={() => setSelectedDuration(option.hours)}
                        className={`relative py-3 px-2 rounded-xl border-2 transition-all text-center ${
                          selectedDuration === option.hours
                            ? "border-purple-500 bg-purple-100 ring-2 ring-purple-300"
                            : "border-gray-200 bg-gray-50 hover:border-purple-300"
                        }`}
                      >
                        {option.popular && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-yellow-500 text-[10px] font-bold text-black rounded-full">
                            POPULAR
                          </span>
                        )}
                        {/* Visible checkmark for selected duration */}
                        {selectedDuration === option.hours && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                            ✓
                          </span>
                        )}
                        <span className={`text-sm font-semibold ${selectedDuration === option.hours ? "text-purple-700" : "text-gray-700"}`}>
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Summary */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">CHECK-IN</p>
                    <p className="text-lg font-bold text-gray-900">{formatTimeDisplay(formData.checkInTime)}</p>
                    <p className="text-xs text-gray-600">{formatDateDisplay(formData.checkInTime)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-[2px] bg-purple-300"></div>
                    <div className="px-3 py-1 rounded-full bg-purple-200 text-purple-700 text-sm font-semibold">
                      {selectedDuration}h
                    </div>
                    <div className="w-8 h-[2px] bg-purple-300"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">CHECK-OUT</p>
                    <p className="text-lg font-bold text-gray-900">{formatTimeDisplay(formData.checkOutTime)}</p>
                    <p className="text-xs text-gray-600">{formatDateDisplay(formData.checkOutTime)}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Booking Summary - Right Side */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-purple-100 bg-white shadow-lg">
              <div className="p-4 sm:p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">📋 Booking Summary</h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Slot</span>
                    <span className="font-medium text-gray-900">{slot.name || slot.location}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-medium text-gray-900">{selectedDuration} hours</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Rate</span>
                    <span className="font-medium text-gray-900">₹{slot.pricePerHour}/hr</span>
                  </div>

                  {formData.vehicleId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Vehicle</span>
                      <span className="font-medium text-gray-900">
                        {vehicles.find(v => v.id === parseInt(formData.vehicleId))?.vehicleNumber}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <div className="text-right">
                        <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                          ₹{totalCost}
                        </span>
                        {slot.pricePerHour === 0 && (
                          <p className="text-xs text-green-600">FREE PARKING! 🎉</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={!formData.vehicleId || !formData.checkInTime}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                >
                  {!formData.vehicleId ? "Select a Vehicle" : "Confirm Booking →"}
                </Button>

                <p className="text-center text-xs text-gray-400 mt-3">
                  Free cancellation up to 1 hour before check-in
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
