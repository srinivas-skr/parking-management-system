import React from 'react'
import { motion } from 'framer-motion'
import { ParkingCircle, Search, AlertCircle, Calendar, Car } from 'lucide-react'

export default function EmptyState({ type = 'default', title, description }) {
  const configs = {
    slots: { icon: ParkingCircle, bgColor: 'bg-purple-50', iconColor: 'text-purple-400' },
    bookings: { icon: Calendar, bgColor: 'bg-blue-50', iconColor: 'text-blue-400' },
    vehicles: { icon: Car, bgColor: 'bg-green-50', iconColor: 'text-green-400' },
    search: { icon: Search, bgColor: 'bg-gray-50', iconColor: 'text-gray-400' },
    error: { icon: AlertCircle, bgColor: 'bg-red-50', iconColor: 'text-red-400' },
    default: { icon: Search, bgColor: 'bg-gray-50', iconColor: 'text-gray-400' },
  }

  const config = configs[type] || configs.default
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 180 }}
        className={`w-20 h-20 rounded-full ${config.bgColor} flex items-center justify-center mb-4`}
      >
        <Icon className={`w-10 h-10 ${config.iconColor}`} />
      </motion.div>

      <motion.h3 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="text-lg font-semibold text-slate-900 mb-2">
        {title}
      </motion.h3>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="text-sm text-slate-500 text-center max-w-md">
        {description}
      </motion.p>
    </motion.div>
  )
}
