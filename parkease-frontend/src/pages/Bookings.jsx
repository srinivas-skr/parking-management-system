

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import Navbar from "../components/Navbar"
import BookingCard from "../components/BookingCard"
import EmptyState from "../components/EmptyState"
import Skeleton from "../components/ui/skeleton"
import { toast } from 'sonner'
import api from "../services/api"

export default function Bookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await api.get("/bookings")
      // Backend returns List<BookingResponse> directly, not wrapped in ApiResponse
      setBookings(response.data || [])
    } catch (error) {
      console.error("Failed to fetch bookings:", error)
      toast.error(error.response?.data?.message || "Failed to fetch bookings")
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async (bookingId) => {
    try {
      // Backend uses POST, not PATCH
      await api.post(`/bookings/${bookingId}/checkin`)
      toast.success("Checked in successfully")
      fetchBookings()
    } catch (error) {
      console.error("Failed to check in:", error)
      toast.error(error.response?.data?.message || "Failed to check in")
    }
  }

  const handleCheckOut = async (bookingId) => {
    try {
      // Backend uses POST, not PATCH
      await api.post(`/bookings/${bookingId}/checkout`)
      toast.success("Checked out successfully")
      fetchBookings()
    } catch (error) {
      console.error("Failed to check out:", error)
      toast.error(error.response?.data?.message || "Failed to check out")
    }
  }

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return

    try {
      await api.delete(`/bookings/${bookingId}`)
      toast.success("Booking cancelled successfully")
      fetchBookings()
    } catch (error) {
      console.error("Failed to cancel booking:", error)
      toast.error(error.response?.data?.message || "Failed to cancel booking")
    }
  }

  const filterBookings = (status) => {
    if (status === "all") return bookings
    return bookings.filter((booking) => booking.status === status)
  }

  if (loading) {
    return (
      <motion.div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-10 w-64 bg-purple-200/50" />
          <Skeleton className="h-12 w-full max-w-md bg-purple-100/50" />
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border-2 border-purple-100">
                <Skeleton className="h-4 w-32 mb-4 bg-purple-200/50" />
                <Skeleton className="h-6 w-full mb-2 bg-purple-100/50" />
                <Skeleton className="h-8 w-full bg-purple-100/50" />
              </div>
            ))}
          </div>
        </main>
      </motion.div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50"
    >
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 sm:p-8 shadow-2xl mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">My Bookings</h1>
          <p className="text-purple-100 text-base sm:text-lg">View and manage your parking bookings</p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full flex flex-nowrap overflow-x-auto justify-start sm:justify-center bg-white/80 backdrop-blur-sm border-2 border-purple-200 shadow-lg rounded-xl p-1 h-auto no-scrollbar">
            <TabsTrigger value="all" className="flex-shrink-0 flex-1 min-w-[80px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">All</TabsTrigger>
            <TabsTrigger value="BOOKED" className="flex-shrink-0 flex-1 min-w-[80px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">Booked</TabsTrigger>
            <TabsTrigger value="ACTIVE" className="flex-shrink-0 flex-1 min-w-[80px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white">Active</TabsTrigger>
            <TabsTrigger value="COMPLETED" className="flex-shrink-0 flex-1 min-w-[80px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-600 data-[state=active]:to-slate-600 data-[state=active]:text-white">Completed</TabsTrigger>
            <TabsTrigger value="CANCELLED" className="flex-shrink-0 flex-1 min-w-[80px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-rose-600 data-[state=active]:text-white">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filterBookings(activeTab).length === 0 ? (
              <EmptyState
                type="bookings"
                title="No bookings found"
                description={
                  activeTab === "all"
                    ? "You haven't made any parking reservations. Book a slot from the dashboard to get started!"
                    : `No ${activeTab.toLowerCase()} bookings at the moment`
                }
              />
            ) : (
              <motion.div 
                className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 }
                  }
                }}
              >
                {filterBookings(activeTab).map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onCheckIn={handleCheckIn}
                    onCheckOut={handleCheckOut}
                    onCancel={handleCancel}
                  />
                ))}
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </motion.div>
  )
}
