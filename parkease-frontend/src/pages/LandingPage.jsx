import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { 
  Play,
  LogIn,
  ArrowRight,
  Zap
} from "lucide-react"
import { Button } from "../components/ui/button"
import { toast } from "sonner"
import { useAuth } from "../context/AuthContext"
import api from "../services/api"
import LoadingScreen from "../components/LoadingScreen"
import SplineBackground from "../components/SplineBackground"

export default function LandingPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showFullScreenLoader, setShowFullScreenLoader] = useState(false)

  // Demo login handler - automatically logs in with demo credentials
  const handleDemoLogin = async () => {
    try {
      setLoading(true)
      setShowFullScreenLoader(true) // Show beautiful loading screen
      
      // Demo credentials
      const credentials = {
        usernameOrEmail: "demo@parking.com",
        password: "demo123"
      }

      console.log("🚀 Attempting demo login...")
      const response = await api.post("/auth/login", credentials)
      console.log("✅ Demo login response:", response.data)
      
      if (response.data.token) {
        // Extract user data from response
        const { token, id, username, email, fullName, role } = response.data
        const userData = { id, username, email, fullName, role }
        
        // Use AuthContext login to properly set auth state
        login(token, userData)
        
        toast.success("Welcome to demo mode! 👋", { id: "demo-login" })
        
        // Navigate to dashboard
        setTimeout(() => {
          setShowFullScreenLoader(false)
          navigate("/dashboard")
        }, 800)
      } else {
        throw new Error("No token received")
      }
    } catch (error) {
      console.error("❌ Demo login failed:", error)
      toast.error("Demo login failed. Redirecting to login page...", { id: "demo-login" })
      setShowFullScreenLoader(false)
      // Fallback: redirect to login page
      setTimeout(() => navigate("/login"), 1500)
    } finally {
      setLoading(false)
    }
  }

  // Show loading screen if active
  if (showFullScreenLoader) {
    return <LoadingScreen message="Logging you in..." />
  }

  return (
    <div className="min-h-screen">
      {/* FULL-SCREEN 3D BACKGROUND - Covers entire viewport */}
      <SplineBackground />
      
      {/* All content floats on top with z-20 for clickability */}
      <div className="relative z-20">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Hero Content with backdrop blur for readability */}
          <div className="relative z-10 container mx-auto px-4 py-12 sm:py-20 text-center">
          <div>
            {/* Badge - STATIC for performance */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full text-purple-900 mb-8 border border-purple-200 shadow-sm">
              <Zap className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold">Industry-Leading Parking Solution</span>
            </div>

            {/* Main Headline - STATIC for performance (no floating animation) */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Smart Parking
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                Made Simple
              </span>
            </h1>

            {/* Subheadline - Dark color like "Smart Parking" for visibility */}
            <p className="text-lg sm:text-2xl text-slate-900 font-medium mb-12 sm:mb-24 max-w-3xl mx-auto leading-relaxed">
              Find Free & Paid Parking Across Bengaluru - 50+ Real Locations
            </p>

            {/* CTA Buttons - 3 options: Try Demo, Create Account, Sign In */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap w-full sm:w-auto">
              <Button
                onClick={handleDemoLogin}
                disabled={loading}
                size="lg"
                className="w-full sm:w-auto group bg-purple-600 text-white hover:bg-purple-700 px-8 py-6 rounded-xl text-lg font-semibold shadow-2xl shadow-purple-500/30 hover:shadow-3xl hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] transition-all duration-300 hover:scale-105 hover:-translate-y-2 disabled:opacity-50"
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                {loading ? "Logging in..." : "Try Demo (Guest)"}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                onClick={() => navigate("/register")}
                size="lg"
                className="w-full sm:w-auto group bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 px-8 py-6 rounded-xl text-lg font-semibold shadow-xl shadow-green-500/20 hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2"
              >
                <span className="mr-2">✨</span>
                Create Account
              </Button>

              <Button
                onClick={() => navigate("/login")}
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-white/50 backdrop-blur-md text-slate-900 border-2 border-white/60 hover:bg-white/80 px-8 py-6 rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all duration-300 hover:scale-105 hover:-translate-y-2"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
              </Button>
            </div>

            {/* Stats - STATIC (no whileInView, no whileHover animations) */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-20">
              {[
                { number: "10K+", label: "Active Users" },
                { number: "50K+", label: "Bookings" },
                { number: "99.9%", label: "Uptime" }
              ].map((stat, index) => (
                <div 
                  key={index} 
                  className="text-center hover:scale-105 transition-transform duration-300"
                >
                  <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">{stat.number}</div>
                  <div className="text-slate-600 text-sm sm:text-base">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

          {/* Scroll indicator - STATIC */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
            <div className="w-6 h-10 rounded-full border-2 border-slate-400 flex items-start justify-center p-2">
              <div className="w-1.5 h-1.5 bg-slate-600 rounded-full" />
            </div>
          </div>
        </section>

      {/* Features Section - TRANSPARENT so 3D shows through */}
        <section className="py-24 relative overflow-hidden">
          {/* No background decorations - let the 3D shine through */}
          
          <div className="container mx-auto px-4 relative z-10">
          {/* Features Header - White text with hard drop-shadow for visibility */}
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Why Choose ParkEase?
            </h2>
          </div>

          {/* Feature Cards - White bg, no blur (performance optimized) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: "🅿️",
                title: "Real-Time Availability",
                description: "See available parking spots instantly with live updates. No more driving around searching.",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: "⚡",
                title: "Instant Booking",
                description: "Reserve your spot in seconds with our streamlined booking process. Quick and hassle-free.",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                icon: "🔒",
                title: "Secure Payments",
                description: "Safe and encrypted payment processing. Your financial data is always protected.",
                gradient: "from-green-500 to-emerald-500"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                {/* Static icon */}
                <div className="text-5xl mb-6 text-center">
                  {feature.icon}
                </div>
                
                <h3 className={`text-xl font-bold text-gray-800 mb-3 text-center bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed text-center">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
          </div>
        </section>

      {/* Footer - SOLID background to cover the 3D and let GPU rest */}
        <footer className="bg-gray-900 text-gray-400 py-8 relative z-30">
          <div className="container mx-auto px-4 text-center">
          <p className="mb-2">&copy; 2025 ParkEase. Built with ❤️ for smart cities.</p>
          <p className="text-sm">
            Built by{" "}
            <a 
              href="https://github.com/srinivas-skr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors font-semibold"
            >
              Srinivas K
            </a>
            {" | "}
            <a 
              href="https://github.com/srinivas-skr/parking-management-system" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              GitHub ↗
            </a>
          </p>
          </div>
        </footer>
        {/* End of relative z-10 wrapper */}
      </div>
      {/* End of main container */}
    </div>
  )
}

