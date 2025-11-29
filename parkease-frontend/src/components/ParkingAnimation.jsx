import { motion } from "framer-motion"

const ParkingAnimation = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="flex justify-center items-center my-12"
    >
      <style>{`
        @keyframes wave {
          0%, 100% {
            transform: translateY(0) scaleX(1);
          }
          50% {
            transform: translateY(-15px) scaleX(1.05);
          }
        }

        .wave-container {
          width: 400px;
          height: 200px;
          max-width: 90vw;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 30px;
          padding: 40px;
        }

        .wave-line {
          height: 4px;
          border-radius: 10px;
          animation: wave 3s ease-in-out infinite;
        }

        .wave-1 {
          background: linear-gradient(90deg, rgba(139,92,246,0.8), rgba(236,72,153,0.8));
          animation-delay: 0s;
          box-shadow: 0 0 20px rgba(139,92,246,0.6);
        }

        .wave-2 {
          background: linear-gradient(90deg, rgba(236,72,153,0.8), rgba(6,182,212,0.8));
          animation-delay: 0.3s;
          box-shadow: 0 0 20px rgba(236,72,153,0.6);
        }

        .wave-3 {
          background: linear-gradient(90deg, rgba(6,182,212,0.8), rgba(139,92,246,0.8));
          animation-delay: 0.6s;
          box-shadow: 0 0 20px rgba(6,182,212,0.6);
        }

        @media (max-width: 640px) {
          .wave-container {
            width: 300px;
            height: 150px;
            gap: 20px;
            padding: 20px;
          }
          .wave-line {
            height: 3px;
          }
        }
      `}</style>

      <div className="wave-container">
        <div className="wave-line wave-1" />
        <div className="wave-line wave-2" />
        <div className="wave-line wave-3" />
      </div>
    </motion.div>
  )
}

export default ParkingAnimation
