"use client";

import { motion } from "framer-motion";
import { QrCode, CheckCircle2 } from "lucide-react";

type AnimatedLoadingProps = {
  title?: string;
  subtitle?: string;
};

export default function AnimatedLoading({
  title,
  subtitle,
}: AnimatedLoadingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="flex flex-col items-center gap-8">
        {/* Animated QR Code Container */}
        <div className="relative">
          {/* Outer scanning ring */}
          <motion.div
            className="absolute inset-0 rounded-2xl border-4 border-blue-500"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* QR Code Icon */}
          <motion.div
            className="relative bg-white rounded-2xl p-8 shadow-2xl"
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <QrCode className="w-24 h-24 text-blue-600" strokeWidth={1.5} />
            </motion.div>

            <CornerDecorations />
          </motion.div>

          {/* Scanning line */}
          <motion.div
            className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
            animate={{
              top: ["20%", "80%", "20%"],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Text Section (only render if provided) */}
        {(title || subtitle) && (
          <div className="flex flex-col items-center gap-3">
            {title && (
              <motion.h1
                className="text-2xl font-semibold text-gray-800"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {title}
              </motion.h1>
            )}

            {subtitle && (
              <motion.p
                className="text-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {subtitle}
              </motion.p>
            )}

            {/* Animated dots */}
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-blue-600 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Floating check icons */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${20 + i * 30}%`,
              top: `${30 + i * 15}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeInOut",
            }}
          >
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------- */
/* Sub-component                       */
/* ---------------------------------- */

function CornerDecorations() {
  return (
    <>
      <div className="absolute top-2 left-2 w-4 h-4 border-l-4 border-t-4 border-blue-600 rounded-tl" />
      <div className="absolute top-2 right-2 w-4 h-4 border-r-4 border-t-4 border-blue-600 rounded-tr" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-l-4 border-b-4 border-blue-600 rounded-bl" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-r-4 border-b-4 border-blue-600 rounded-br" />
    </>
  );
}
