

import { Car, Bike, Edit, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "./ui/button"
import { Card } from "./ui/card"

const vehicleIcons = {
  FOUR_WHEELER: Car,
  TWO_WHEELER: Bike,
  car: Car,
  bike: Bike,
  // Accept capitalized friendly labels from local data file
  Car: Car,
  Bike: Bike,
}

const vehicleTypeLabels = {
  FOUR_WHEELER: "Car",
  TWO_WHEELER: "Bike",
  Car: "Car",
  Bike: "Bike",
}

const vehicleTypeColors = {
  FOUR_WHEELER: "from-green-500 to-emerald-500",
  TWO_WHEELER: "from-blue-500 to-cyan-500",
  Car: "from-green-500 to-emerald-500",
  Bike: "from-blue-500 to-cyan-500",
}

export default function VehicleCard({ vehicle, onEdit, onDelete }) {
  const Icon = vehicleIcons[vehicle.vehicleType] || Car
  const typeLabel = vehicleTypeLabels[vehicle.vehicleType] || vehicle.vehicleType
  const gradient = vehicleTypeColors[vehicle.vehicleType] || "from-blue-500 to-indigo-500"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className="group relative overflow-hidden border-2 border-indigo-200 bg-gradient-to-br from-white to-indigo-50 transition-all hover:shadow-2xl hover:border-indigo-400">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity group-hover:opacity-5`} />

        <div className="relative p-6">
          <div className="mb-4 flex items-start justify-between">
            <motion.div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${gradient} shadow-lg`}
              whileHover={{ rotate: 5, scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <Icon className="h-8 w-8 text-white" />
            </motion.div>

            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => onEdit(vehicle)} 
                className="h-9 w-9 p-0 hover:bg-indigo-100 text-indigo-600 rounded-lg"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(vehicle)}
                className="h-9 w-9 p-0 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">{vehicle.vehicleNumber}</h3>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${gradient} text-white shadow-md`}>
                {typeLabel}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
