import React, { useState, useEffect, Suspense } from 'react'

// Lazy load the REAL Spline component (not an iframe)
const Spline = React.lazy(() => import('@splinetool/react-spline'))

export default function SplineBackground() {
  const [is3DReady, setIs3DReady] = useState(false)

  // Backend Warmup - fire and forget
  useEffect(() => {
    const backendUrl = import.meta.env.VITE_API_URL || 'https://parking-management-system-hs2i.onrender.com'
    fetch(`${backendUrl}/api/health`).catch(() => {
      console.log('Waking up backend server...')
    })
  }, [])

  return (
    <>
      {/* Full-screen Background - Fixed position, z-index 0 */}
      <div className="fixed top-0 left-0 w-full h-screen z-0 overflow-hidden">
        
        {/* 1. INSTANT POSTER - Shows immediately */}
        <div 
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${is3DReady ? 'opacity-0' : 'opacity-100'}`}
          style={{ 
            backgroundImage: 'url(/landing-poster.png)',
            backgroundColor: '#1a1a2e'
          }}
        />

        {/* 2. LOCAL 3D SCENE - Loads from /public/scene.splinecode */}
        <Suspense fallback={null}>
          <div 
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${is3DReady ? 'opacity-100' : 'opacity-0'}`}
            style={{ pointerEvents: 'none' }}
          >
            <Spline 
              scene="/scene.splinecode"
              onLoad={() => setIs3DReady(true)}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </Suspense>

        {/* Dark gradient overlay for text readability */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(59, 130, 246, 0.3))'
          }}
        />
      </div>
    </>
  )
}
