import { useState } from 'react'
import { motion } from 'framer-motion'

export default function SplineBackground() {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      {/* Full-screen 3D Background - Fixed position */}
      <div className="fixed top-0 left-0 w-full h-screen z-0 overflow-hidden">
        
        {/* Loading state */}
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
            />
          </div>
        )}
        
        {/* Spline 3D Scene - Full Screen */}
        <iframe 
          src="https://my.spline.design/evcharging-Q5yxLxt5BIhjWQn6wT5HieGe/" 
          frameBorder="0" 
          width="100%" 
          height="100%"
          loading="lazy"
          onLoad={() => setLoaded(true)}
          style={{ 
            pointerEvents: 'none', // Prevents blocking clicks on content
            opacity: 0.6 // Slight transparency for better text readability
          }}
          title="3D Parking Background"
        />
        
        {/* Dark overlay for better text contrast */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.5), rgba(59, 130, 246, 0.3))'
          }}
        />
      </div>
    </>
  )
}
