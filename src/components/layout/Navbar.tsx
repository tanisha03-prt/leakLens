import React from 'react';
import { 
  Droplet, 
  Bell, 
  Database, 
  Plus, 
  UserCheck, 
  Shield, 
  Wrench, 
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { User, NotificationItem } from '../../types/index.ts';

interface NavbarProps {
  currentUser: User;
  onRoleSwitch: (role: 'resident' | 'maintenance' | 'admin') => void;
  onOpenReportModal: () => void;
  onOpenBackendModal: () => void;
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  activeView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onRoleSwitch,
  onOpenReportModal,
  onOpenBackendModal,
  notifications,
  onOpenNotifications,
  activeView
}) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getBreadcrumb = () => {
    switch (activeView) {
      case 'dashboard': return 'Dashboard / Campus Water Overview';
      case 'incidents': return 'Incidents / Live Leak Management';
      case 'hotspots': return 'Hotspot Map / Floor-Level Risk Matrix';
      case 'analytics': return 'Analytics / Water Wastage & MTTR';
      case 'maintenance': return 'Maintenance Desk / Work Orders & Evidence';
      case 'buildings': return 'Campus / Structural Riser Network';
      case 'admin': return 'Administration / Users & SLA Policies';
      case 'backend': return 'MERN Backend / MongoDB Architecture';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Zone 1: Brand & View Indicator */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <Droplet className="w-5 h-5 fill-white/20" />
          </div>
          <span className="font-bold text-slate-900 text-base tracking-tight whitespace-nowrap shrink-0">
            LeakLens
          </span>
        </div>

        <span className="text-slate-300 hidden md:inline">|</span>

        <span className="text-xs font-medium text-slate-500 truncate hidden sm:inline">
          {getBreadcrumb()}
        </span>
      </div>

      {/* Zone 2: Fast Role Switcher & System Specs */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Backend & DB Status Badge */}
        <button
          onClick={onOpenBackendModal}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
          title="Inspect Express REST API & MongoDB Mongoose Models"
        >
          <Database className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden lg:inline">Backend & DB</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </button>

        {/* Role Switcher Dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-blue-50/80 border border-blue-200 hover:bg-blue-100/80 rounded-md transition-colors whitespace-nowrap">
            {currentUser.role === 'admin' && <Shield className="w-3.5 h-3.5 text-indigo-600" />}
            {currentUser.role === 'maintenance' && <Wrench className="w-3.5 h-3.5 text-amber-600" />}
            {currentUser.role === 'resident' && <UserIcon className="w-3.5 h-3.5 text-blue-600" />}
            <span className="capitalize font-semibold">{currentUser.role}</span>
            <span className="hidden xl:inline text-slate-500 font-normal">({currentUser.name.split(' ')[0]})</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Quick Switch Menu */}
          <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-1 hidden group-hover:block z-30">
            <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Switch Persona (Test Roles)
            </div>
            <button
              onClick={() => onRoleSwitch('resident')}
              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${currentUser.role === 'resident' ? 'bg-blue-50/70 font-semibold text-blue-700' : 'text-slate-700'}`}
            >
              <div className="flex items-center gap-2">
                <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                <div>
                  <p className="font-medium">Aditi Sharma</p>
                  <p className="text-[10px] text-slate-400 font-normal">Resident (Room B-312)</p>
                </div>
              </div>
              {currentUser.role === 'resident' && <UserCheck className="w-3.5 h-3.5 text-blue-600" />}
            </button>

            <button
              onClick={() => onRoleSwitch('maintenance')}
              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${currentUser.role === 'maintenance' ? 'bg-amber-50/70 font-semibold text-amber-800' : 'text-slate-700'}`}
            >
              <div className="flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5 text-amber-600" />
                <div>
                  <p className="font-medium">Rajesh Kumar</p>
                  <p className="text-[10px] text-slate-400 font-normal">Senior Plumber</p>
                </div>
              </div>
              {currentUser.role === 'maintenance' && <UserCheck className="w-3.5 h-3.5 text-amber-600" />}
            </button>

            <button
              onClick={() => onRoleSwitch('admin')}
              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${currentUser.role === 'admin' ? 'bg-indigo-50/70 font-semibold text-indigo-700' : 'text-slate-700'}`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <div>
                  <p className="font-medium">Vikram Malhotra</p>
                  <p className="text-[10px] text-slate-400 font-normal">Estate Officer (Admin)</p>
                </div>
              </div>
              {currentUser.role === 'admin' && <UserCheck className="w-3.5 h-3.5 text-indigo-600" />}
            </button>
          </div>
        </div>

        {/* Notifications Icon Button */}
        <button
          onClick={onOpenNotifications}
          className="relative p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          title="View Notifications & Escalations"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Zone 3: Primary Action */}
        <button
          onClick={onOpenReportModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Report Leak</span>
        </button>
      </div>
    </header>
  );
};
