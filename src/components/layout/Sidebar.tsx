import React from 'react';
import { 
  LayoutDashboard, 
  AlertCircle, 
  MapPin, 
  BarChart3, 
  Wrench, 
  Building2, 
  ShieldCheck, 
  Database,
  Waves,
  Droplets,
  Layers
} from 'lucide-react';
import { UserRole } from '../../types/index.ts';

interface SidebarProps {
  currentRole: UserRole;
  activeView: string;
  onSelectView: (view: string) => void;
  activeLeaksCount: number;
  criticalCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeView,
  onSelectView,
  activeLeaksCount,
  criticalCount
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
      roles: ['resident', 'maintenance', 'admin']
    },
    {
      id: 'incidents',
      label: 'Live Incidents',
      icon: AlertCircle,
      badge: activeLeaksCount > 0 ? activeLeaksCount : null,
      badgeColor: criticalCount > 0 ? 'bg-red-500' : 'bg-blue-500',
      roles: ['resident', 'maintenance', 'admin']
    },
    {
      id: 'hotspots',
      label: 'Hotspot Matrix',
      icon: MapPin,
      badge: 'Interactive',
      roles: ['resident', 'maintenance', 'admin']
    },
    {
      id: 'analytics',
      label: 'Water Analytics',
      icon: BarChart3,
      badge: null,
      roles: ['maintenance', 'admin']
    },
    {
      id: 'maintenance',
      label: 'Maintenance Desk',
      icon: Wrench,
      badge: currentRole === 'maintenance' ? 'My Queue' : null,
      roles: ['maintenance', 'admin']
    },
    {
      id: 'buildings',
      label: 'Campus Buildings',
      icon: Building2,
      badge: null,
      roles: ['resident', 'maintenance', 'admin']
    },
    {
      id: 'admin',
      label: 'Admin Console',
      icon: ShieldCheck,
      badge: null,
      roles: ['admin']
    },
    {
      id: 'backend',
      label: 'MERN & DB Specs',
      icon: Database,
      badge: 'REST API',
      roles: ['resident', 'maintenance', 'admin']
    }
  ];

  const allowedItems = navItems.filter(item => item.roles.includes(currentRole));

  return (
    <aside className="w-60 bg-[#0B1F3A] text-slate-300 flex flex-col shrink-0 border-r border-[#152e50] select-none">
      {/* Top Brand Banner */}
      <div className="p-4 border-b border-[#1A3860]/50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow">
          <Waves className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-white text-sm tracking-tight leading-tight">
            LeakLens OS
          </h1>
          <p className="text-[11px] text-blue-300/70 font-normal">
            Smart Hydraulic Guard
          </p>
        </div>
      </div>

      {/* Main Navigation links */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-blue-300/60 uppercase tracking-wider">
          Workspace Navigation
        </div>

        {allowedItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all group ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-sm font-semibold' 
                  : 'text-slate-300 hover:text-white hover:bg-[#132c4e]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-blue-300/80 group-hover:text-blue-200'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  typeof item.badge === 'number' 
                    ? `${item.badgeColor || 'bg-blue-500'} text-white font-bold`
                    : 'bg-[#183963] text-blue-200 text-[9px]'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Water Conservation KPI Widget in Sidebar */}
      <div className="p-3 mx-2 mb-3 bg-[#102A4C]/80 border border-[#1E3E68]/60 rounded-lg">
        <div className="flex items-center justify-between text-[11px] text-blue-200 font-medium mb-1">
          <span className="flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-blue-400" />
            Campus Water Saved
          </span>
          <span className="text-emerald-400 font-mono font-semibold">+18.5k L</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-snug">
          Early detection prevented approx. 18,500 L runoff this month.
        </p>
      </div>

      {/* Role Footer */}
      <div className="p-3 border-t border-[#1A3860]/50 bg-[#09182C] flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2 truncate">
          <Layers className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="capitalize font-mono text-[11px] truncate">
            {currentRole} Access
          </span>
        </div>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="System Online" />
      </div>
    </aside>
  );
};
