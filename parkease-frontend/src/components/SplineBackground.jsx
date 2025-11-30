import React, { useState, useEffect, Suspense } from 'react'

// Lazy load to prevent initial freeze
const Spline = React.lazy(() => import('@splinetool/react-spline'))

export default function SplineBackground() {
  const [is3DReady, setIs3DReady] = useState(false)

  // Backend Warmup - fire and forget
  useEffect(() => {
    const backendUrl = import.meta.env.VITE_API_URL || 'https://parking-management-system-hs2i.onrender.com'
    fetch(`${backendUrl}/api/health`).catch(() => {})
  }, [])

  return (
    <div className="fixed inset-0 w-full h-full bg-[#1A1A2E] overflow-hidden z-0">
      
      {/* 1. STATIC POSTER (Instant Load) */}
      <img 
        src="/landing-poster.png" 
        alt="Background" 
        className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ease-in-out
          ${is3DReady ? 'opacity-0' : 'opacity-100'}`} 
      />

      {/* 2. 3D SCENE (Lazy Load + Anti-Freeze Delay) */}
      <Suspense fallback={null}>
        <div className={`absolute inset-0 w-full h-full z-10 transition-opacity duration-1000 ease-in-out ${is3DReady ? 'opacity-100' : 'opacity-0'}`}>
          <Spline 
            scene="/scene.splinecode"
            onLoad={() => {
              // Wait 500ms for shaders to compile before showing
              setTimeout(() => {
                setIs3DReady(true)
              }, 500)
            }}
          />
        </div>
      </Suspense>

      {/* Dark gradient overlay for text readability */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.2))'
        }}
      />
    </div>
  )
}
