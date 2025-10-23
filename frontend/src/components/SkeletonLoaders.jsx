import { motion } from "framer-motion"

// Skeleton for stat cards
export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-300 rounded w-16 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  )
}

// Skeleton for slot cards
export function SlotCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-6 bg-gray-300 rounded w-24 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
  )
}

// Alias for compatibility
export const SkeletonCard = SlotCardSkeleton

// Skeleton for booking cards
export function BookingCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-300 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
        <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
          <div className="h-4 bg-gray-300 rounded w-24"></div>
        </div>
        <div>
          <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
          <div className="h-4 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-9 bg-gray-200 rounded flex-1"></div>
        <div className="h-9 bg-gray-200 rounded flex-1"></div>
      </div>
    </div>
  )
}

// Skeleton for vehicle cards
export function VehicleCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-300 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-300 rounded w-24"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-9 bg-gray-200 rounded flex-1"></div>
        <div className="h-9 bg-gray-200 rounded w-9"></div>
      </div>
    </div>
  )
}

// Skeleton for table rows
export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
      <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
    </tr>
  )
}

// Page-level skeleton (for entire pages)
export function PageSkeleton({ title = "Loading..." }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-10 bg-gray-300 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>

        {/* Content grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Compact inline loader (for buttons, small areas)
export function InlineLoader({ className = "" }) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <motion.div
        className="w-2 h-2 bg-current rounded-full"
        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
      />
      <motion.div
        className="w-2 h-2 bg-current rounded-full"
        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
      />
      <motion.div
        className="w-2 h-2 bg-current rounded-full"
        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
      />
    </div>
  )
}

// Spinner (for buttons)
export function Spinner({ className = "w-5 h-5" }) {
  return (
    <motion.div
      className={`border-2 border-current border-t-transparent rounded-full ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  )
}
