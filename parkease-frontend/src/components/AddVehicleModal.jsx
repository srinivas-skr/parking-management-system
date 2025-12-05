import { useState, useEffect } from "react"
import { Car, Bike } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"

const vehicleTypes = [
  { value: "FOUR_WHEELER", label: "Car", icon: Car },
  { value: "TWO_WHEELER", label: "Bike", icon: Bike },
]

const colors = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
]

// Auto-generate a random color
const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)]

export default function AddVehicleModal({ open, onClose, onSubmit, editVehicle = null }) {
  const [formData, setFormData] = useState({
    vehicleNumber: "",
    vehicleType: "FOUR_WHEELER",
    color: getRandomColor(),
  })

  // Reset form when modal opens/closes or when editing
  useEffect(() => {
    if (open) {
      if (editVehicle) {
        setFormData({
          vehicleNumber: editVehicle.vehicleNumber || "",
          vehicleType: editVehicle.vehicleType || "FOUR_WHEELER",
          color: editVehicle.color || getRandomColor(),
        })
      } else {
        setFormData({
          vehicleNumber: "",
          vehicleType: "FOUR_WHEELER",
          color: getRandomColor(),
        })
      }
    }
  }, [editVehicle, open])

  const handleSubmit = (e) => {
    e.preventDefault()
    // Auto-assign random color if not set
    const dataToSubmit = {
      ...formData,
      color: formData.color || getRandomColor(),
      ...(editVehicle?.id && { id: editVehicle.id })
    }
    onSubmit(dataToSubmit)
    setFormData({ vehicleNumber: "", vehicleType: "FOUR_WHEELER", color: getRandomColor() })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="border-white/10 bg-background/95 backdrop-blur-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            {editVehicle ? "Edit Vehicle" : "Add New Vehicle"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="vehicleNumber" className="text-white/80">
              Vehicle Number
            </Label>
            <Input
              id="vehicleNumber"
              placeholder="e.g., ABC-1234"
              value={formData.vehicleNumber}
              onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
              required
              className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white/80">Vehicle Type</Label>
            <div className="grid grid-cols-3 gap-3">
              {vehicleTypes.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, vehicleType: type.value })}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                      formData.vehicleType === type.value
                        ? "border-primary bg-primary/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                    <span className="text-sm text-white">{type.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Color is auto-assigned - show preview only */}
          <div className="space-y-2">
            <Label className="text-white/80">Vehicle Color (Auto-assigned)</Label>
            <div className="flex items-center gap-3">
              <div 
                className="h-12 w-12 rounded-xl shadow-lg border-2 border-white/20"
                style={{ backgroundColor: formData.color }}
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, color: getRandomColor() })}
                className="text-sm text-white/60 hover:text-white underline"
              >
                🎲 Generate new color
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-purple-500 text-purple-600 hover:bg-purple-50 bg-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 text-white"
            >
              {editVehicle ? "Save Changes" : "Add Vehicle"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
