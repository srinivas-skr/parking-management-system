

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { Button } from "../components/ui/button"
import Navbar from "../components/Navbar"
import VehicleCard from "../components/VehicleCard"
import AddVehicleModal from "../components/AddVehicleModal"
import EmptyState from "../components/EmptyState"
import Skeleton from "../components/ui/skeleton"
import { toast } from 'sonner'
import api from "../services/api"

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const response = await api.get("/vehicles")
      // Backend returns List<Vehicle> directly, not wrapped in ApiResponse
      setVehicles(response.data || [])
    } catch (error) {
      console.error("Failed to fetch vehicles:", error)
      toast.error(error.response?.data?.message || "Failed to fetch vehicles")
    } finally {
      setLoading(false)
    }
  }

  const handleAddVehicle = async (vehicleData) => {
    try {
      // Check if we're editing or adding
      if (vehicleData.id) {
        // Update existing vehicle
        await api.put(`/vehicles/${vehicleData.id}`, vehicleData)
        toast.success("Vehicle updated successfully")
      } else {
        // Add new vehicle
        await api.post("/vehicles", vehicleData)
        toast.success("Vehicle added successfully")
      }
      setShowAddModal(false)
      setEditingVehicle(null)
      fetchVehicles()
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save vehicle")
    }
  }

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle)
    setShowAddModal(true)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditingVehicle(null)
  }

  const handleDeleteVehicle = async (vehicle) => {
    if (!window.confirm(`Delete vehicle ${vehicle.vehicleNumber}?`)) return

    try {
      // Backend uses SQL 'id', not MongoDB '_id'
      await api.delete(`/vehicles/${vehicle.id}`)
      toast.success("Vehicle deleted successfully")
      fetchVehicles()
    } catch (error) {
      console.error("Failed to delete vehicle:", error)
      toast.error(error.response?.data?.message || "Failed to delete vehicle")
    }
  }

  if (loading) {
    return (
      <motion.div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-10 w-64 bg-indigo-200/50" />
          <Skeleton className="h-12 w-32 bg-purple-200/50" />
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border-2 border-indigo-100">
                <Skeleton className="h-4 w-32 mb-4 bg-indigo-200/50" />
                <Skeleton className="h-6 w-full mb-2 bg-indigo-100/50" />
                <Skeleton className="h-8 w-full bg-indigo-100/50" />
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
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50"
    >
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">My Vehicles</h1>
              <p className="text-indigo-100 text-sm sm:text-base md:text-lg">Manage your registered vehicles</p>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto bg-white text-indigo-600 hover:bg-indigo-50 font-semibold shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Vehicle
            </Button>
          </div>
        </motion.div>

        {vehicles.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex min-h-[400px] items-center justify-center"
          >
            <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl p-12 shadow-2xl text-center max-w-md border-2 border-indigo-100">
              <motion.div 
                className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              >
                <div className="text-5xl">🚗</div>
              </motion.div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">No vehicles yet</h3>
              <p className="mb-6 text-gray-600 text-lg">Add your first vehicle to start booking parking slots</p>
              <Button 
                onClick={() => setShowAddModal(true)} 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Your First Vehicle
              </Button>
            </div>
          </motion.div>
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
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} onEdit={handleEditVehicle} onDelete={handleDeleteVehicle} />
            ))}
          </motion.div>
        )}
      </main>

      <AddVehicleModal open={showAddModal} onClose={handleCloseModal} onSubmit={handleAddVehicle} editVehicle={editingVehicle} />
    </motion.div>
  )
}
