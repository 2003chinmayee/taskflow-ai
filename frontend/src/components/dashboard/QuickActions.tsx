import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FolderPlus, UserPlus, CalendarDays } from "lucide-react";
import InviteOrgMemberModal from "../organization/InviteOrgMemberModal";

interface QuickActionsProps {
  orgId: string;
}

export default function QuickActions({ orgId }: QuickActionsProps) {
  const navigate = useNavigate();
  const [inviteOpen, setInviteOpen] = useState(false);

  const actions = [
    { label: "New Project", icon: FolderPlus, onClick: () => navigate("/projects") },
    { label: "Invite Member", icon: UserPlus, onClick: () => setInviteOpen(true) },
    { label: "View Calendar", icon: CalendarDays, onClick: () => navigate("/calendar") },
  ];

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="flex flex-wrap gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            aria-label={action.label}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 bg-white/[0.04] border border-white/8 hover:bg-white/[0.08] hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <action.icon size={15} />
            {action.label}
          </button>
        ))}
      </motion.div>

      <InviteOrgMemberModal open={inviteOpen} onClose={() => setInviteOpen(false)} orgId={orgId} />
    </>
  );
}