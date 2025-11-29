import { motion } from "framer-motion"

export default function ParkingHeroAnimation() {
  return (
    <motion.div 
      className="relative w-96 h-[420px]"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      {/* Glass morphism container */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-blue-500/20" />
        
        {/* Parking Grid Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="parking-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#parking-grid)" />
        </svg>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 gap-8">
          
          {/* Car Parking */}
          <motion.div 
            className="relative group"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {/* Parking Space Background */}
            <div className="absolute inset-0 -m-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            
            <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 min-w-[280px]">
              {/* Parking Lines */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-60" />
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-60" />
              
              <div className="flex items-center gap-4">
                {/* Animated Car Icon */}
                <motion.div
                  className="text-7xl"
                  animate={{ 
                    y: [0, -15, 0],
                    rotateZ: [0, -2, 0, 2, 0]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{ 
                    filter: "drop-shadow(0 10px 30px rgba(59, 130, 246, 0.4))",
                    transform: "perspective(500px) rotateY(-10deg)"
                  }}
                >
                  🚗
                </motion.div>
                
                <div className="flex-1">
                  <div className="text-white/90 text-sm font-medium mb-1 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Available
                  </div>
                  <div className="text-white text-2xl font-bold mb-1">Car Parking</div>
                  <div className="text-white/60 text-sm">4-Wheeler Spaces</div>
                  <div className="text-purple-300 text-xs mt-2 font-semibold">₹50/hour</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bike Parking */}
          <motion.div 
            className="relative group"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {/* Parking Space Background */}
            <div className="absolute inset-0 -m-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            
            <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 min-w-[280px]">
              {/* Parking Lines */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-60" />
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-60" />
              
              <div className="flex items-center gap-4">
                {/* Animated Bike Icon */}
                <motion.div
                  className="text-7xl"
                  animate={{ 
                    y: [0, -12, 0],
                    rotateZ: [0, 3, 0, -3, 0]
                  }}
                  transition={{ 
                    duration: 2.5, 
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                  style={{ 
                    filter: "drop-shadow(0 10px 30px rgba(168, 85, 247, 0.4))",
                    transform: "perspective(500px) rotateY(10deg)"
                  }}
                >
                  🏍️
                </motion.div>
                
                <div className="flex-1">
                  <div className="text-white/90 text-sm font-medium mb-1 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Available
                  </div>
                  <div className="text-white text-2xl font-bold mb-1">Bike Parking</div>
                  <div className="text-white/60 text-sm">2-Wheeler Spaces</div>
                  <div className="text-purple-300 text-xs mt-2 font-semibold">₹20/hour</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bottom Badge */}
          <motion.div 
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-2 rounded-full text-white text-sm font-semibold shadow-lg"
            animate={{ 
              y: [0, -5, 0],
              boxShadow: [
                "0 10px 30px rgba(168, 85, 247, 0.3)",
                "0 15px 40px rgba(168, 85, 247, 0.5)",
                "0 10px 30px rgba(168, 85, 247, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ✨ Real-time Availability
          </motion.div>
        </div>
      </div>

      {/* Floating particles effect */}
      <motion.div 
        className="absolute top-10 right-10 w-3 h-3 bg-yellow-300 rounded-full"
        animate={{ 
          y: [0, -100],
          opacity: [1, 0],
          scale: [1, 0.5]
        }}
        transition={{ duration: 3, repeat: Infinity, delay: 0 }}
      />
      <motion.div 
        className="absolute top-20 left-10 w-2 h-2 bg-blue-300 rounded-full"
        animate={{ 
          y: [0, -80],
          opacity: [1, 0],
          scale: [1, 0.5]
        }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
      />
      <motion.div 
        className="absolute bottom-20 right-20 w-2 h-2 bg-purple-300 rounded-full"
        animate={{ 
          y: [0, -60],
          opacity: [1, 0],
          scale: [1, 0.5]
        }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      />
    </motion.div>
  )
}
