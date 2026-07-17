import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderKanban, CalendarDays, UserPlus, LogOut, ChevronDown, Users, Menu, X } from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import { useOrgStore } from "../../store/orgStore";
import ActiveTimerBanner from "./ActiveTimerBanner";
import InviteOrgMemberModal from "../organization/InviteOrgMemberModal";
import NotificationBell from "../notifications/NotificationBell";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/projects", label: "Projects", icon: FolderKanban },
  { path: "/calendar", label: "Calendar", icon: CalendarDays },
];

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { currentOrg } = useOrgStore();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isActive = (path: string) =>
    path === "/projects" ? location.pathname.startsWith("/projects") : location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const goTo = (path: string) => {
    navigate(path);
    setMobileNavOpen(false);
  };

  return (
    <>
    <div className="sticky top-0 z-40 border-b border-white/8 bg-zinc-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <span className="text-white font-semibold text-sm flex items-center gap-2 flex-shrink-0">
            <span className="text-violet-400">⚡</span> TaskFlow AI
          </span>

          {/* Desktop nav — hidden below md */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button key={item.path} onClick={() => navigate(item.path)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive(item.path)
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}>
                <item.icon size={14} />
                {item.label}
              </button>
            ))}
            {currentOrg?.currentUserRole === "ORG_ADMIN" && (
              <button onClick={() => navigate("/organization/members")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === "/organization/members"
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}>
                <Users size={14} />
                Team
              </button>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:block">
            <ActiveTimerBanner />
          </div>
          <NotificationBell />

          {currentOrg?.currentUserRole === "ORG_ADMIN" && (
            <button onClick={() => setInviteOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-all">
              <UserPlus size={14} />
              Invite
            </button>
          )}

          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-white/8 transition-all">
              <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase() ?? "?"}
              </div>
              <span className="text-white/70 text-sm hidden lg:inline">{user?.name}</span>
              <ChevronDown size={13} className="text-white/40 hidden sm:inline" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-white/10 bg-zinc-900 shadow-2xl z-20 overflow-hidden">
                  <div className="px-3 py-2.5 border-b border-white/8">
                    <p className="text-white text-xs font-medium truncate">{user?.email}</p>
                    {currentOrg && <p className="text-white/40 text-[11px] mt-0.5 truncate">{currentOrg.name}</p>}
                  </div>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all">
                    <LogOut size={13} />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Hamburger — visible only below md */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/8 transition-all"
          >
            {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile nav panel */}
      {mobileNavOpen && (
        <div className="md:hidden border-t border-white/8 bg-zinc-950/95 px-4 py-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button key={item.path} onClick={() => goTo(item.path)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive(item.path) ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
              }`}>
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
          {currentOrg?.currentUserRole === "ORG_ADMIN" && (
            <button onClick={() => goTo("/organization/members")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                location.pathname === "/organization/members" ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
              }`}>
              <Users size={16} />
              Team
            </button>
          )}
          {currentOrg?.currentUserRole === "ORG_ADMIN" && (
            <button onClick={() => { setInviteOpen(true); setMobileNavOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-all mt-2">
              <UserPlus size={16} />
              Invite
            </button>
          )}
        </div>
      )}
    </div>

    <InviteOrgMemberModal
      open={inviteOpen}
      onClose={() => setInviteOpen(false)}
      orgId={currentOrg?.id ?? ""}
    />
    </>
  );
}