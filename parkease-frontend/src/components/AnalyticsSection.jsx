import { motion } from "framer-motion"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js"
import { TrendingUp, Activity } from "lucide-react"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function AnalyticsSection({ bookings = [] }) {
  // Calculate booking trends for last 7 days
  const getLast7Days = () => {
    const days = []
    const counts = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
      days.push(dayName)
      
      // Count bookings for this day (mock data for now)
      const count = Math.floor(Math.random() * 10) + 5
      counts.push(count)
    }
    
    return { days, counts }
  }

  const { days, counts } = getLast7Days()

  const chartData = {
    labels: days,
    datasets: [
      {
        label: "Bookings",
        data: counts,
        fill: true,
        backgroundColor: "rgba(147, 51, 234, 0.1)",
        borderColor: "rgb(147, 51, 234)",
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: "rgb(147, 51, 234)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        borderRadius: 8,
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 13,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  }

  // Calculate occupancy rate
  const occupancyRate = 68 // Mock data, calculate from actual slots

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8"
    >
      {/* Booking Trends Chart */}
      <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-4 sm:p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          <h3 className="text-base sm:text-lg font-bold text-slate-900">Booking Trends</h3>
          <span className="ml-auto text-xs text-slate-500">Last 7 days</span>
        </div>
        <div className="h-40 sm:h-48 w-full overflow-x-auto">
          <div className="min-w-[300px] h-full">
            <Line data={chartData} options={options} />
          </div>
        </div>
      </div>

      {/* Occupancy Rate */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-4 sm:p-6 shadow-lg text-white">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5" />
          <h3 className="text-base sm:text-lg font-bold">Occupancy Rate</h3>
        </div>
        <div className="space-y-4">
          <div className="text-4xl sm:text-5xl font-bold">{occupancyRate}%</div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="opacity-90">Overall Usage</span>
              <span className="font-semibold">{occupancyRate}%</span>
            </div>
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${occupancyRate}%` }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className="h-full bg-white rounded-full shadow-lg"
              />
            </div>
          </div>
          <div className="pt-3 border-t border-white/20">
            <div className="flex justify-between text-sm opacity-90">
              <span>Peak Hours</span>
              <span className="font-semibold">9 AM - 5 PM</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default AnalyticsSection
