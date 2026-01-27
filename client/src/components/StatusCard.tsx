import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatusCardProps {
  label: string;
  count: number;
  color: "blue" | "orange" | "red" | "green" | "purple" | "gray";
  delay?: number;
}

const colorMap = {
  blue: "bg-blue-500 shadow-blue-500/20",
  orange: "bg-orange-500 shadow-orange-500/20",
  red: "bg-red-500 shadow-red-500/20",
  green: "bg-green-600 shadow-green-600/20",
  purple: "bg-purple-500 shadow-purple-500/20",
  gray: "bg-gray-500 shadow-gray-500/20",
};

export function StatusCard({ label, count, color, delay = 0 }: StatusCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.1, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden rounded-xl p-6 text-white shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl",
        colorMap[color]
      )}
    >
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-bold tracking-tight">{count}</span>
        <span className="mt-1 text-sm font-medium opacity-90">{label}</span>
      </div>
      
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent pointer-events-none" />
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
    </motion.div>
  );
}
