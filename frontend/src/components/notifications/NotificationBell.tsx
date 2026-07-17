import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { useNotificationSocket } from '../../hooks/useNotificationSocket';
import NotificationPanel from './NotificationPanel';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

const {
    notifications,
    isLoading,
    isError,
    refetch,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isMarkingAllAsRead,
  } = useNotifications(true);

  useNotificationSocket(true);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/8 transition-all"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <NotificationPanel
          notifications={notifications}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          isMarkingAllAsRead={isMarkingAllAsRead}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}