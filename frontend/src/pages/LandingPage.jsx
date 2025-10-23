import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, useScroll, useTransform } from "framer-motion"
import { 
  Play,
  LogIn,
  ArrowRight,
  Zap
} from "lucide-react"
import { Button } from "../components/ui/button"
import { toast } from "sonner"
import api from "../services/api"
import LoadingScreen from "../components/LoadingScreen"

export default function LandingPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showFullScreenLoader, setShowFullScreenLoader] = useState(false)
  const { scrollY } = useScroll()
  
  // Parallax transforms
  const heroY = useTransform(scrollY, [0, 500], [0, -50])
  const cardY = useTransform(scrollY, [0, 500], [0, 100])

  // Demo login handler
  const handleDemoLogin = async () => {
    try {
      setLoading(true)
      setShowFullScreenLoader(true) // Show beautiful loading screen
      
      // Demo credentials
      const credentials = {
        usernameOrEmail: "demo@parking.com",
        password: "demo123"
      }

      const response = await api.post("/auth/login", credentials)
      
      if (response.data.token) {
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("user", JSON.stringify(response.data))
        
        toast.success("Welcome to demo mode! 👋", { id: "demo-login" })
        
        // Keep loader for smooth transition
        setTimeout(() => {
          setShowFullScreenLoader(false)
          navigate("/dashboard")
        }, 1000)
      }
    } catch (error) {
      console.error("Demo login failed:", error)
      toast.error("Demo login failed. Please try manual login.", { id: "demo-login" })
      setShowFullScreenLoader(false)
    } finally {
      setLoading(false)
    }
  }

  // Show loading screen if active
  if (showFullScreenLoader) {
    return <LoadingScreen message="Logging you in..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated gradient mesh background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 opacity-95" />
        
        {/* Mesh pattern overlay for depth */}
        <div 
          className="absolute inset-0 opacity-20" 
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 40% 20%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)
            `,
          }}
        />
        
        {/* Animated circles */}
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

        {/* 3D Layered Background Circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ perspective: '1000px' }}>
          {/* Layer 1 - Far back */}
          <motion.div 
            className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
            style={{ transform: 'translateZ(-100px)' }}
            animate={{ 
              x: [0, 100, 0],
              y: [0, 50, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Layer 2 - Middle */}
          <motion.div 
            className="absolute w-72 h-72 bg-purple-500/15 rounded-full blur-2xl right-20 top-40"
            style={{ transform: 'translateZ(-50px)' }}
            animate={{ 
              x: [0, -80, 0],
              y: [0, 60, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Layer 3 - Front */}
          <motion.div 
            className="absolute w-56 h-56 bg-indigo-500/20 rounded-full blur-xl bottom-20 left-20"
            style={{ transform: 'translateZ(50px)' }}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* 3D Floating Parking Card */}
        <motion.div 
          className="hidden lg:block absolute right-10 top-20 w-80 h-96 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl"
          style={{ 
            transform: 'perspective(1000px) rotateY(-15deg) rotateX(5deg)',
            transformStyle: 'preserve-3d',
            y: cardY
          }}
          animate={{ 
            rotateY: [-15, -12, -15],
            rotateX: [5, 8, 5],
            y: [0, -20, 0]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: 'easeInOut' 
          }}
        >
          <div className="p-8 relative z-10">
            <div className="text-6xl mb-4">🅿️</div>
            <div className="text-white/80 text-sm mb-2">PARKING SLOT</div>
            <div className="text-white text-3xl font-bold mb-4">A-123</div>
            <div className="text-white/60 text-sm">Level 2, Zone A</div>
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="flex justify-between text-white/80 text-sm mb-3">
                <span>Status</span>
                <span className="text-green-400 font-semibold">● Available</span>
              </div>
              <div className="flex justify-between text-white/80 text-sm">
                <span>Rate</span>
                <span className="text-white font-semibold">$5/hour</span>
              </div>
            </div>
          </div>
          {/* 3D shadow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl blur-xl -z-10" />
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ y: heroY }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white mb-8 border border-white/30"
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm font-semibold">Industry-Leading Parking Solution</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ 
                opacity: 1, 
                y: [0, -10, 0] // Subtle floating animation
              }}
              transition={{ 
                opacity: { delay: 0.3, duration: 0.8 },
                y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }
              }}
            >
              Smart Parking
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-pink-200">
                Made Simple
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              className="text-xl sm:text-2xl text-purple-100 mb-24 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Find, book, and manage parking spots in real-time with our 
              intelligent parking management system
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <Button
                onClick={handleDemoLogin}
                disabled={loading}
                size="lg"
                className="group bg-white text-purple-600 hover:bg-purple-50 px-8 py-6 rounded-xl text-lg font-semibold shadow-2xl hover:shadow-3xl hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] transition-all duration-300 hover:scale-105 hover:-translate-y-2 disabled:opacity-50"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Try Demo Now
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                onClick={() => navigate("/login")}
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-md text-white border-2 border-white/30 hover:bg-white/20 px-8 py-6 rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all duration-300 hover:scale-105 hover:-translate-y-2"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {[
                { number: "10K+", label: "Active Users" },
                { number: "50K+", label: "Bookings" },
                { number: "99.9%", label: "Uptime" }
              ].map((stat, index) => (
                <motion.div 
                  key={index} 
                  className="text-center transform hover:scale-105 transition-all duration-300 cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ 
                    rotateX: -5,
                    y: -10,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                  }}
                  style={{ 
                    transform: 'perspective(800px) rotateX(2deg)',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-purple-200 text-sm sm:text-base">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/50 flex items-start justify-center p-2">
            <motion.div 
              className="w-1.5 h-1.5 bg-white rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section with 3D Hover Cards */}
      <section className="py-24 bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-100 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Why Choose ParkEase?
            </h2>
            <p className="text-xl text-gray-600">
              Smart features designed for modern parking management
            </p>
          </motion.div>

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
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ 
                  scale: 1.05,
                  rotateY: 5,
                  rotateX: 5,
                  transition: { duration: 0.3 }
                }}
                className="group relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Gradient border effect on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Floating icon */}
                <motion.div 
                  className="text-6xl mb-6 text-center"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 }}
                >
                  {feature.icon}
                </motion.div>
                
                <h3 className={`text-2xl font-bold mb-4 text-center bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 text-center leading-relaxed">
                  {feature.description}
                </p>

                {/* Glow effect on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 -z-10`} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
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
    </div>
  )
}
