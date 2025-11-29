import { useState } from "react"
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

export default function AddVehicleModal({ open, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    vehicleNumber: "",
    vehicleType: "FOUR_WHEELER",
    color: "#3b82f6",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({ vehicleNumber: "", vehicleType: "FOUR_WHEELER", color: "#3b82f6" })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="border-white/10 bg-background/95 backdrop-blur-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Add New Vehicle</DialogTitle>
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

          <div className="space-y-2">
            <Label className="text-white/80">Color</Label>
            <div className="grid grid-cols-8 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`h-10 w-10 rounded-lg transition-all ${
                    formData.color === color
                      ? "ring-2 ring-white ring-offset-2 ring-offset-background"
                      : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/10 hover:bg-white/5 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90"
            >
              Add Vehicle
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
