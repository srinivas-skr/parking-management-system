import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const variants = {
    default: "bg-purple-600 text-white hover:bg-purple-700 shadow-sm hover:shadow-md",
    destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
    outline: "border-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    ghost: "hover:bg-slate-100 text-slate-700",
    link: "text-purple-600 underline-offset-4 hover:underline",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
  }

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-lg px-3 text-sm",
    lg: "h-11 rounded-lg px-8 text-base",
    icon: "h-10 w-10",
  }

  const MotionButton = motion.button

  return (
    <MotionButton
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={cn(
        "inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
