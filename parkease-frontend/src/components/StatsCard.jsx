import { motion } from "framer-motion"
import CountUp from "react-countup"

function StatsCard({ title, value, icon: Icon, gradient, index = 0, prefix = '', suffix = '', decimals = 0 }) {
  const isNumber = typeof value === 'number'
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
      className="relative bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
    >
      {/* Glass-morphism gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900">
            {isNumber ? (
              <CountUp 
                end={value} 
                duration={1.5} 
                decimals={decimals}
                prefix={prefix}
                suffix={suffix}
                separator=","
              />
            ) : (
              value
            )}
          </p>
        </div>
        <motion.div 
          whileHover={{ rotate: 12, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 10 }}
          className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}
        >
          <Icon className="h-6 w-6 text-white" />
        </motion.div>
      </div>
      
      {/* Subtle shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6 }}
      />
    </motion.div>
  )
}

export default StatsCard
