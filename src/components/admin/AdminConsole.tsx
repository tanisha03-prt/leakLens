import React, { useState } from 'react';
import { 
  Users, 
  Building2, 
  ShieldAlert, 
  FileText, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Shield, 
  AlertTriangle,
  Download
} from 'lucide-react';
import { User, Building, LeakReport, AuditLog } from '../../types/index.ts';

interface AdminConsoleProps {
  users: User[];
  buildings: Building[];
  reports: LeakReport[];
  auditLogs: AuditLog[];
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  users,
  buildings,
  reports,
  auditLogs
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'buildings' | 'sla' | 'logs'>('users');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Campus Administration & Operational Policy Console
          </h2>
          <p className="text-xs text-slate-500">
            Configure campus buildings, assign staff privileges, review SLA thresholds, and monitor audit trails.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              activeTab === 'users' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Users & Roles ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('buildings')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              activeTab === 'buildings' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Buildings ({buildings.length})
          </button>
          <button
            onClick={() => setActiveTab('sla')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              activeTab === 'sla' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SLA Policies
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              activeTab === 'logs' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Trail ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* TAB 1: USERS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800">Campus Identity Directory</h3>
            <span className="text-xs text-slate-500">Role-based access control (RBAC) enforced</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-4">Name & Email</th>
                <th className="py-2.5 px-4">Role</th>
                <th className="py-2.5 px-4">Department / Specialty</th>
                <th className="py-2.5 px-4">Room / Phone</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-4">
                    <div className="font-semibold text-slate-800">{u.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                  </td>
                  <td className="py-2.5 px-4 capitalize">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      u.role === 'admin' ? 'bg-indigo-100 text-indigo-800' :
                      u.role === 'maintenance' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">
                    {u.department || u.specialty || 'General Resident'}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">
                    <div>{u.roomNumber || 'Faculty Office'}</div>
                    <div className="text-[11px] text-slate-400">{u.phone}</div>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="text-emerald-700 font-medium">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: BUILDINGS */}
      {activeTab === 'buildings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {buildings.map(b => (
            <div key={b.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{b.name}</h4>
                  <p className="text-xs text-slate-500">Code: <strong className="font-mono text-slate-800">{b.code}</strong></p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase font-mono">
                  {b.type}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <div className="text-slate-400 text-[10px]">Total Floors</div>
                  <div className="font-mono font-bold text-slate-800">{b.totalFloors}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">Total Rooms</div>
                  <div className="font-mono font-bold text-slate-800">{b.totalRooms}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">Open Incidents</div>
                  <div className="font-mono font-bold text-red-600">{b.openLeaksCount}</div>
                </div>
              </div>

              <div className="mt-3 text-[11px] text-slate-500">
                <strong>Wings:</strong> {b.wings.join(', ')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: SLA POLICIES */}
      {activeTab === 'sla' && (
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Water Incident Service Level Agreement (SLA) & Escalation Rules
          </h3>
          <p className="text-xs text-slate-500">
            Automatic notification dispatch and facility management escalation when incidents exceed resolution benchmarks.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg text-xs">
              <div className="font-bold text-red-900">Critical Leaks (Pipe Bursts / Mains)</div>
              <p className="text-slate-600 mt-1">Maximum Response Time: <strong>15 minutes</strong></p>
              <p className="text-slate-600">Auto-Escalation Threshold: <strong>12 hours</strong></p>
              <p className="text-[11px] text-red-700 mt-2 font-medium">Triggers immediate SMS & Estate Officer notification.</p>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs">
              <div className="font-bold text-amber-900">Severe Flow / Joint Cracks</div>
              <p className="text-slate-600 mt-1">Maximum Response Time: <strong>2 hours</strong></p>
              <p className="text-slate-600">Auto-Escalation Threshold: <strong>24 hours</strong></p>
              <p className="text-[11px] text-amber-700 mt-2 font-medium">Dispatches lead plumber with replacement union fittings.</p>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs">
              <div className="font-bold text-blue-900">Minor & Moderate Drips</div>
              <p className="text-slate-600 mt-1">Maximum Response Time: <strong>6 hours</strong></p>
              <p className="text-slate-600">Auto-Escalation Threshold: <strong>48 hours</strong></p>
              <p className="text-[11px] text-blue-700 mt-2 font-medium">Scheduled in daily maintenance rounds.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800">Immutable Audit Log History</h3>
            <span className="text-xs text-slate-500 font-mono">{auditLogs.length} logged events</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3 flex items-start justify-between gap-4 hover:bg-slate-50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-700">{log.action}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-medium text-slate-800">{log.actorName}</span>
                    <span className="text-[10px] text-slate-400 capitalize">({log.actorRole})</span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{log.details}</p>
                </div>
                <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
