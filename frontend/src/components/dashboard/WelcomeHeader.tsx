import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface WelcomeHeaderProps {
  userName: string;
  orgName: string;
  onCreateProject: () => void;
}

export default function WelcomeHeader({ userName, orgName, onCreateProject }: WelcomeHeaderProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-3xl overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-white/[0.04] to-transparent" />
      <div className="absolute inset-0 backdrop-blur-2xl border border-white/10 rounded-3xl" />
      <motion.div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none bg-violet-500"
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative p-8 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <p className="text-white/40 text-sm mb-1">{today}</p>
          <h1 className="text-[28px] leading-tight font-bold text-white tracking-tight">
            {greeting}, {userName.split(" ")[0]}
          </h1>
          <p className="text-white/45 text-[15px] mt-1.5">{orgName}</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={onCreateProject}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 transition-all self-start lg:self-auto"
        >
          <Plus size={16} />
          Create Project
        </motion.button>
      </div>
    </motion.div>
  );
}