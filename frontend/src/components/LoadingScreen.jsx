import { motion } from "framer-motion"

export default function LoadingScreen({ message = "Waking up servers..." }) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center z-50">
      {/* Animated background circles */}
      <motion.div 
        className="absolute top-20 left-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute bottom-20 right-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative z-10 text-center">
        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            duration: 0.8, 
            type: "spring",
            stiffness: 100
          }}
          className="mb-8"
        >
          {/* Parking Logo */}
          <div className="relative w-40 h-40 mx-auto">
            {/* Outer circle with pulse */}
            <motion.div
              className="absolute inset-0 bg-white/20 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.2, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Main logo container */}
            <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center shadow-2xl">
              {/* Parking "P" Symbol */}
              <motion.svg
                width="80"
                height="80"
                viewBox="0 0 100 100"
                className="text-purple-600"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ 
                  duration: 2, 
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              >
                {/* P letter for Parking */}
                <motion.path
                  d="M 30 20 L 30 80 M 30 20 L 60 20 C 70 20, 75 30, 75 40 C 75 50, 70 60, 60 60 L 30 60"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </motion.svg>
            </div>

            {/* Rotating ring */}
            <motion.div
              className="absolute inset-0 border-4 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-4xl font-bold text-white mb-4"
        >
          ParkEase
        </motion.h1>

        {/* Loading Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-white/90 text-lg mb-8"
        >
          {message}
        </motion.p>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-3 h-3 bg-white rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: index * 0.2
              }}
            />
          ))}
        </div>

        {/* Helpful tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-12 text-white/70 text-sm"
        >
          <p>💡 Tip: First load takes ~30-60s as servers wake up</p>
          <p className="mt-2">Next visits will be instant!</p>
        </motion.div>
      </div>
    </div>
  )
}
