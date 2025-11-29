import { useState } from 'react'
import { motion } from 'framer-motion'

export default function ParkingVideoAnimation() {
  const [videoLoaded, setVideoLoaded] = useState(false)

  return (
    <motion.div 
      className="relative w-full h-full"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Glass morphism container */}
      <div className="relative w-full h-full bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
        
        {/* Purple gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-transparent to-blue-500/30 pointer-events-none z-10" />
        
        {/* Video animation - Using public domain parking animation */}
        <video
          className={`w-full h-full object-cover transition-opacity duration-500 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onLoadedData={() => setVideoLoaded(true)}
        >
          {/* Multiple sources for better compatibility */}
          <source src="https://cdn.pixabay.com/vimeo/463459809/parking-47973.mp4?width=640&hash=ca2c3c7e8247a4e1f8c16f41fc3d6e94c3a6f72e" type="video/mp4" />
          {/* Fallback for older browsers */}
          Your browser does not support the video tag.
        </video>

        {/* Fallback animated SVG while video loads */}
        {!videoLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/90 to-blue-900/90">
            {/* Animated parking icon */}
            <motion.div
              className="text-center"
              animate={{ 
                y: [0, -20, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="text-8xl mb-4 filter drop-shadow-2xl">
                🚗
              </div>
              <div className="text-white text-lg font-semibold">
                Smart Parking
              </div>
            </motion.div>
          </div>
        )}

        {/* Floating info cards */}
        <motion.div 
          className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg z-20"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <div>
              <div className="text-xs text-gray-500">Status</div>
              <div className="text-sm font-bold text-gray-900">Available Now</div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg z-20"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl">⚡</div>
            <div>
              <div className="text-xs text-gray-500">Real-time</div>
              <div className="text-sm font-bold text-gray-900">55 Slots</div>
            </div>
          </div>
        </motion.div>

        {/* Bottom badge */}
        <motion.div 
          className="absolute bottom-6 right-6 bg-gradient-to-r from-purple-500 to-blue-500 px-5 py-2 rounded-full text-white text-sm font-semibold shadow-lg z-20"
          animate={{ 
            y: [0, -5, 0],
            boxShadow: [
              "0 10px 30px rgba(168, 85, 247, 0.4)",
              "0 15px 40px rgba(168, 85, 247, 0.6)",
              "0 10px 30px rgba(168, 85, 247, 0.4)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ✨ AI Powered
        </motion.div>
      </div>

      {/* Glow effect */}
      <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-2xl -z-10 animate-pulse" />
    </motion.div>
  )
}
