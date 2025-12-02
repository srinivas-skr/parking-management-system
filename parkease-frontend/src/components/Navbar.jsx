

import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Car, Search, Bell, User, LogOut, Settings, Map, Menu, X, Home, Calendar, Truck } from "lucide-react"

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
    setMobileMenuOpen(false)
  }

  // Navigation links configuration
  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: Home },
    { to: "/slots", label: "Find Parking", icon: Map },
    { to: "/vehicles", label: "My Vehicles", icon: Truck },
    { to: "/bookings", label: "My Bookings", icon: Calendar },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          {/* Left: Logo + Desktop Nav */}
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Car className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900">ParkEase</span>
            </Link>
            
            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to}>
                  <Button 
                    variant="ghost" 
                    className={`text-slate-700 hover:text-purple-600 hover:bg-purple-50 ${
                      isActive(link.to) ? 'bg-purple-50 text-purple-600' : ''
                    }`}
                  >
                    <link.icon className="mr-2 h-4 w-4" />
                    {link.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Search, Bell, Profile (Desktop) + Hamburger (Mobile) */}
          <div className="flex items-center gap-3">
            {/* Search - Hidden on mobile */}
            <div className="hidden lg:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search slots..." className="pl-10 w-64 border-slate-200 focus:border-purple-500 focus:ring-purple-500" />
            </div>

            {/* Notification Bell - Visible on all screens */}
            <Button variant="ghost" size="icon" className="relative hover:bg-slate-100">
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
            </Button>

            {/* Profile Dropdown - Hidden on mobile, shown in mobile menu */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-purple-600" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border border-slate-200 shadow-lg">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold text-slate-900">{user?.fullName}</p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-200" />
                  <DropdownMenuItem onClick={() => navigate("/settings")} className="text-slate-700 hover:bg-slate-50 cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:bg-red-50 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Hamburger Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden hover:bg-slate-100"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6 text-slate-700" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-Out Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-Out Menu */}
      <div className={`fixed inset-y-0 right-0 w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
        mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Car className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">ParkEase</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="h-6 w-6 text-slate-700" />
          </Button>
        </div>

        {/* User Info */}
        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <User className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{user?.fullName}</p>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Links */}
        <div className="p-4 space-y-2">
          {navLinks.map((link) => (
            <Link 
              key={link.to} 
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(link.to) 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <link.icon className="h-5 w-5" />
              <span className="font-medium">{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Mobile Menu Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-700 hover:bg-slate-100"
            onClick={() => {
              navigate("/settings")
              setMobileMenuOpen(false)
            }}
          >
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>
    </>
  )
}

export default Navbar
