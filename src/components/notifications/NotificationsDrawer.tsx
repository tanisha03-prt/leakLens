import React from 'react';
import { 
  X, 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Layers,
  Check
} from 'lucide-react';
import { NotificationItem } from '../../types/index.ts';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onSelectTicket?: (ticketId: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onSelectTicket
}) => {
  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'sla_breach':
      case 'urgent':
        return <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />;
      case 'resolved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />;
      case 'assignment':
        return <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md h-full shadow-2xl border-l border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-[#0B1F3A] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-sm">Notifications & Escalations</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No recent notifications or alerts.
            </div>
          ) : (
            notifications.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  if (!item.isRead) onMarkRead(item.id);
                  if (item.ticketId && onSelectTicket) onSelectTicket(item.ticketId);
                }}
                className={`p-3 rounded-lg border text-xs transition-colors cursor-pointer flex items-start gap-3 ${
                  item.isRead 
                    ? 'bg-slate-50 border-slate-200 text-slate-600' 
                    : 'bg-blue-50/50 border-blue-200 text-slate-900 font-medium'
                }`}
              >
                {getIcon(item.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold truncate text-slate-900">{item.title}</h4>
                    <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    {item.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>{notifications.filter(n => !n.isRead).length} unread alerts</span>
          <button
            onClick={onClose}
            className="px-3 py-1 font-medium text-slate-700 hover:bg-slate-200 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
