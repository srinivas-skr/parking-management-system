

import { Link, useNavigate } from "react-router-dom"
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
import { Car, Search, Bell, User, LogOut, Settings, Map } from "lucide-react"

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Car className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">ParkEase</span>
          </Link>
          <div className="hidden md:flex items-center gap-2">
            <Link to="/dashboard">
              <Button variant="ghost" className="text-slate-700 hover:text-purple-600 hover:bg-purple-50">Dashboard</Button>
            </Link>
            <Link to="/slots">
              <Button variant="ghost" className="text-slate-700 hover:text-purple-600 hover:bg-purple-50">
                <Map className="mr-2 h-4 w-4" />
                Find Parking
              </Button>
            </Link>
            <Link to="/vehicles">
              <Button variant="ghost" className="text-slate-700 hover:text-purple-600 hover:bg-purple-50">My Vehicles</Button>
            </Link>
            <Link to="/bookings">
              <Button variant="ghost" className="text-slate-700 hover:text-purple-600 hover:bg-purple-50">My Bookings</Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search slots..." className="pl-10 w-64 border-slate-200 focus:border-purple-500 focus:ring-purple-500" />
          </div>

          <Button variant="ghost" size="icon" className="relative hover:bg-slate-100">
            <Bell className="h-5 w-5 text-slate-600" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
          </Button>

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
      </div>
    </nav>
  )
}

export default Navbar
