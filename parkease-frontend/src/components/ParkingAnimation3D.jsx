import { motion } from 'framer-motion'
import { useState } from 'react'

export default function ParkingAnimation3D() {
  const [loaded, setLoaded] = useState(false)

  return (
    <motion.div 
      className="w-full h-[500px]"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      {/* Glass morphism container */}
      <div className="relative w-full h-full backdrop-blur-xl bg-white/10 rounded-3xl p-2 shadow-2xl border border-white/20 overflow-hidden">
        
        {/* Loading placeholder - shows while iframe loads */}
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl z-10">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"
              />
              <p className="text-purple-600 font-semibold">Loading 3D Scene...</p>
            </div>
          </div>
        )}
        
        {/* Optimized Spline 3D Scene - Lazy loaded */}
        <iframe 
          src="https://my.spline.design/evcharging-Q5yxLxt5BIhjWQn6wT5HieGe/" 
          frameBorder="0" 
          width="100%" 
          height="100%"
          className="rounded-2xl"
          title="3D Parking Animation"
          loading="lazy"
          onLoad={() => setLoaded(true)}
        />
        
        {/* Gradient overlay for better integration */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none rounded-3xl" />
        
        {/* Info badge */}
        <motion.div 
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-2 rounded-full text-white text-sm font-semibold shadow-lg z-10"
          animate={{ 
            y: [0, -5, 0],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🎨 Interactive 3D View
        </motion.div>
      </div>
      
      {/* Glow effect */}
      <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-2xl -z-10 animate-pulse" />
    </motion.div>
  )
}
