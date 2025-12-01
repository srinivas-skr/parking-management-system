import React, { useState, useEffect, Suspense } from 'react';

// Lazy load the library
const Spline = React.lazy(() => import('@splinetool/react-spline'));

// Error Boundary (Prevents white screen crashes)
class SplineErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error("Spline 3D Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export default function SplineBackground() {
  const [shouldLoadSpline, setShouldLoadSpline] = useState(false);
  const [is3DReady, setIs3DReady] = useState(false);

  useEffect(() => {
    // 1. Backend Warm-up (same URL as api.js)
    const backendUrl = "https://parking-management-system-hs2i.onrender.com"; 
    fetch(`${backendUrl}/api/health`).catch(() => {});

    // 2. Hardware Check (Keep Image for weak devices)
    const hardwareConcurrency = window.navigator.hardwareConcurrency || 4;
    const isLowEndDevice = hardwareConcurrency < 4;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isLowEndDevice || isMobile) {
      console.log("Optimizing: Keeping Static Image (Low Spec Device)");
      return; 
    }

    // 3. Idle Loading (Wait until browser is bored)
    const start3DLoad = () => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => setShouldLoadSpline(true), { timeout: 5000 });
      } else {
        setTimeout(() => setShouldLoadSpline(true), 3000);
      }
    };

    const initialTimer = setTimeout(start3DLoad, 3000);
    return () => clearTimeout(initialTimer);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full bg-[#1A1A2E] overflow-hidden z-0">
      
      {/* 1. STATIC POSTER (Instant Load) */}
      <img 
        src="/landing-poster.png" 
        alt="Background" 
        className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ease-in-out ${is3DReady ? 'opacity-0' : 'opacity-100'}`}
      />
      
      {/* 2. 3D SCENE (Deferred Load) */}
      {shouldLoadSpline && (
        <Suspense fallback={null}>
          <SplineErrorBoundary>
            <div className={`absolute inset-0 w-full h-full z-10 transition-opacity duration-1000 ease-in-out ${is3DReady ? 'opacity-100' : 'opacity-0'}`}>
              <Spline 
                scene="/scene.splinecode"
                // 🏆 HYBRID OPTIMIZATION (Best of Both AIs):
                
                // 1. Only render when moving (saves battery)
                renderOnDemand={true}
                
                // 2. Limit resolution to 1x via PROP (Official API)
                pixelRatio={1}
                
                onLoad={(splineApp) => {
                   // 3. FALLBACK: Force via internal API if prop doesn't work (Safety Net)
                   if (splineApp && splineApp.setPixelRatio) {
                     splineApp.setPixelRatio(1);
                   }
                   // 4. Reveal after small delay to hide any initialization lag
                   setTimeout(() => setIs3DReady(true), 500);
                }}
              />
            </div>
          </SplineErrorBoundary>
        </Suspense>
      )}
    </div>
  );
}
