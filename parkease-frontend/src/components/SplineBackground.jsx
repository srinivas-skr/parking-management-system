import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function SplineBackground() {
  const [splineLoaded, setSplineLoaded] = useState(false)

  useEffect(() => {
    // Silent backend warmup - fire and forget (no await)
    const API_URL = import.meta.env.VITE_API_URL || 'https://parking-management-system-hs2i.onrender.com'
    fetch(`${API_URL}/api/health/ping`).catch(() => {
      // Silently ignore errors - this is just to wake up the server
    })
  }, [])

  return (
    <>
      {/* Full-screen Background - Fixed position, z-index 0 */}
      <div className="fixed top-0 left-0 w-full h-screen z-0 overflow-hidden">
        
        {/* INSTANT: Static poster image as immediate background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
          style={{ 
            backgroundImage: 'url(/landing-poster.png)',
            backgroundColor: '#1a1a2e', // Fallback color
            opacity: splineLoaded ? 0 : 1 // Fade out when Spline loads
          }}
        />

        {/* Dark gradient overlay for text readability */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.5), rgba(59, 130, 246, 0.3))'
          }}
        />

        {/* LAZY: Spline 3D iframe loads in background, fades in when ready */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: splineLoaded ? 0.7 : 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <iframe 
            src="https://my.spline.design/evcharging-Q5yxLxt5BIhjWQn6wT5HieGe/" 
            frameBorder="0" 
            width="100%" 
            height="100%"
            loading="lazy"
            onLoad={() => setSplineLoaded(true)}
            style={{ pointerEvents: 'none' }}
            title="3D Parking Background"
          />
        </motion.div>
      </div>
    </>
  )
}
