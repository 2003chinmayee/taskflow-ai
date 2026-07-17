import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { WorkLog } from "../../types/workLog";

interface WorkLogModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (payload: { durationMinutes: number; logDate: string; description?: string }) => void;
  isLoading: boolean;
  workLog?: WorkLog | null;
}

export default function WorkLogModal({ open, onClose, onSave, isLoading, workLog }: WorkLogModalProps) {
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("30");
  const [logDate, setLogDate] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      if (workLog) {
        setHours(String(Math.floor(workLog.durationMinutes / 60)));
        setMinutes(String(workLog.durationMinutes % 60));
        setLogDate(workLog.logDate);
        setDescription(workLog.description ?? "");
      } else {
        setHours("0");
        setMinutes("30");
        setLogDate(new Date().toISOString().slice(0, 10));
        setDescription("");
      }
    }
  }, [open, workLog]);

  const totalMinutes = (parseInt(hours || "0", 10) * 60) + parseInt(minutes || "0", 10);
  const isValid = totalMinutes > 0 && !!logDate && new Date(logDate) <= new Date();

  const handleSubmit = () => {
    if (!isValid) return;
    onSave({ durationMinutes: totalMinutes, logDate, description: description || undefined });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-white font-semibold text-lg mb-1">{workLog ? "Edit Work Log" : "Log Time"}</h2>
            <p className="text-white/40 text-sm mb-5">{workLog ? "Update this time entry" : "Manually add time spent"}</p>

            <div className="space-y-4">
              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Duration</label>
                <div className="flex items-center gap-2">
                  <input type="number" min="0" value={hours} onChange={(e) => setHours(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-violet-500/50 transition-all" />
                  <span className="text-white/40 text-xs">hrs</span>
                  <input type="number" min="0" max="59" value={minutes} onChange={(e) => setMinutes(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-violet-500/50 transition-all" />
                  <span className="text-white/40 text-xs">min</span>
                </div>
                {totalMinutes <= 0 && (
                  <p className="text-red-400 text-xs mt-1.5">Duration must be greater than 0</p>
                )}
              </div>

              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Date</label>
                <input type="date" value={logDate} max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-violet-500/50 transition-all [color-scheme:dark]" />
              </div>

              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="What did you work on?" rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 outline-none focus:border-violet-500/50 resize-none transition-all" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/8 text-sm transition-all">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={!isValid || isLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-all">
                {isLoading ? "Saving..." : workLog ? "Save Changes" : "Add Log"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}