import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Home, ArrowLeft, Search, MapPin } from "lucide-react"

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-white/10 backdrop-blur-xl rounded-3xl p-8 sm:p-12 text-center max-w-lg border border-white/20 shadow-2xl"
      >
        {/* Big 404 Text */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="relative mb-6"
        >
          <span className="text-[120px] sm:text-[150px] font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent leading-none">
            404
          </span>
          {/* Floating parking icon */}
          <motion.div
            animate={{ y: [-5, 5, -5], rotate: [-5, 5, -5] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="w-20 h-20 bg-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-4xl">🅿️</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Parking Spot Not Found
          </h2>
          <p className="text-white/70 mb-8 text-base sm:text-lg">
            Oops! Looks like this parking spot doesn't exist. 
            The page you're looking for might have been moved or deleted.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => navigate("/")}
            className="group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-purple-500/30"
          >
            <Home className="h-5 w-5 group-hover:scale-110 transition-transform" />
            Go to Homepage
          </button>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-lg transition-all border border-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </button>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 pt-6 border-t border-white/10"
        >
          <p className="text-white/50 text-sm mb-4">Or try these popular pages:</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate("/slots")}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-sm transition-all"
            >
              <MapPin className="h-4 w-4" />
              Find Parking
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-sm transition-all"
            >
              <Search className="h-4 w-4" />
              Dashboard
            </button>
          </div>
        </motion.div>

        {/* Fun Illustration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-5xl flex justify-center gap-2"
        >
          <motion.span
            animate={{ rotate: [-10, 10, -10] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            🚗
          </motion.span>
          <span>💨</span>
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            ❓
          </motion.span>
        </motion.div>
      </motion.div>
    </div>
  )
}
