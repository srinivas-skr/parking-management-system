import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../context/AuthContext"
import PageTransition from "../components/PageTransition"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { toast } from "sonner"
import { Car, Lock, Mail, ArrowLeft } from "lucide-react"
import api from "../services/api"

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await api.post("/auth/login", formData)
      const data = response.data
      
      // Backend returns flat structure with token and user fields together
      const { token, id, username, email, fullName, role } = data
      const user = { id, username, email, fullName, role }

      login(token, user)
      toast.success("Login successful!")
      navigate("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      toast.error(error.response?.data?.message || "Invalid credentials")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageTransition className="min-h-screen flex">
      {/* Left side - Gradient with stats */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex lg:w-1/2 gradient-primary items-center justify-center p-12 relative overflow-hidden"
      >
        {/* Animated background circles */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"
        />
        
        <div className="relative z-10 max-w-md text-white">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-8"
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <Car className="h-12 w-12" />
            </motion.div>
            <h1 className="text-4xl font-bold">ParkEase</h1>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl mb-12 text-white/90"
          >
            Smart parking management system for modern cities
          </motion.p>
          <div className="grid grid-cols-2 gap-6">
            {[
              { value: "500+", label: "Parking Slots", delay: 0.4 },
              { value: "10K+", label: "Happy Users", delay: 0.5 },
              { value: "24/7", label: "Support", delay: 0.6 },
              { value: "99%", label: "Uptime", delay: 0.7 }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: stat.delay }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="glass-dark rounded-lg p-6 backdrop-blur-sm"
              >
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-white/80">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-background to-muted">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Back to Home Link */}
          <Link
            to="/"
            className="inline-flex items-center text-primary hover:text-primary/80 mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <Card className="glass shadow-2xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-3xl font-bold gradient-text">Welcome back</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <Label htmlFor="usernameOrEmail">Email or Username</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="usernameOrEmail"
                      name="usernameOrEmail"
                      type="text"
                      placeholder="Enter your email or username"
                      value={formData.usernameOrEmail}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-2"
                >
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full gradient-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        Signing in...
                      </span>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </motion.div>
              </form>

              {/* Demo Login Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-4"
              >
                <Button 
                  type="button"
                  variant="outline"
                  className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                  onClick={() => {
                    setFormData({
                      usernameOrEmail: "demo@parkease.com",
                      password: "demo123"
                    })
                  }}
                >
                  <span className="mr-2">🚀</span> One-Click Demo Login
                </Button>
              </motion.div>
              
              {/* Register Link */}
              <div className="mt-6 text-center">
                <p className="text-muted-foreground text-sm">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-primary hover:text-primary/80 font-semibold hover:underline"
                  >
                    Create one
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  )
}

export default Login
