import React, { useState } from 'react';
import { 
  Wrench, 
  CheckCircle2, 
  Clock, 
  Camera, 
  AlertTriangle, 
  FileText, 
  Droplet,
  ExternalLink
} from 'lucide-react';
import { LeakReport, User } from '../../types/index.ts';

interface MaintenanceDeskProps {
  reports: LeakReport[];
  currentUser: User;
  onOpenReport: (report: LeakReport) => void;
  onUpdateProgress: (reportId: string, payload: any) => Promise<any>;
}

export const MaintenanceDesk: React.FC<MaintenanceDeskProps> = ({
  reports,
  currentUser,
  onOpenReport,
  onUpdateProgress
}) => {
  // Assigned to current user or all open if admin
  const assignedReports = reports.filter(r => 
    r.assignment?.assignedToId === currentUser.id ||
    (currentUser.role === 'admin' && r.status !== 'resolved' && r.status !== 'closed')
  );

  const completedToday = reports.filter(r => r.status === 'resolved' || r.status === 'closed');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Maintenance Technician Work Desk
          </h2>
          <p className="text-xs text-slate-500">
            Active dispatched assignments for {currentUser.name} ({currentUser.specialty || 'Plumbing Services'}).
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="bg-blue-50 text-blue-800 px-3 py-1.5 rounded border border-blue-200 font-semibold font-mono">
            {assignedReports.length} Open Work Orders
          </div>
          <div className="bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded border border-emerald-200 font-semibold font-mono">
            {completedToday.length} Verified Repairs
          </div>
        </div>
      </div>

      {/* Grid of Work Orders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assignedReports.length === 0 ? (
          <div className="col-span-2 bg-white rounded-lg border border-slate-200 p-12 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No Pending Work Orders</h3>
            <p className="text-xs text-slate-500 mt-1">
              All assigned complaints are currently resolved. Check back when new leak reports are dispatched.
            </p>
          </div>
        ) : (
          assignedReports.map(report => (
            <div
              key={report.id}
              className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 flex flex-col justify-between hover:border-blue-400 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {report.ticketNumber}
                    </span>
                    <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      report.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      report.severity === 'severe' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {report.severity}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-slate-600 capitalize">
                    {report.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-900 mb-1">
                  {report.title}
                </h3>
                <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                  {report.description}
                </p>

                <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1 mb-3">
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <strong className="text-slate-800">{report.buildingName} Floor {report.floor} ({report.roomOrZone})</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Component:</span>
                    <span className="capitalize font-mono text-slate-700">{report.leakType.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Flow Baseline:</span>
                    <span className="font-mono text-slate-700">{report.leakRateLph} L/hr (~{report.waterLossLiters} L lost)</span>
                  </div>
                </div>

                {/* Photo preview thumbnail */}
                <div className="flex items-center gap-3">
                  <img
                    src={report.photoUrl}
                    alt="Leak photo"
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 object-cover rounded border border-slate-200 shrink-0"
                  />
                  <div className="text-[11px] text-slate-500">
                    <div>Reported by <strong>{report.reportedBy.name}</strong></div>
                    <div className="text-slate-400 font-mono text-[10px]">{new Date(report.reportedAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between">
                <button
                  onClick={() => onOpenReport(report)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Dossier & Evidence Log</span>
                </button>

                <button
                  onClick={() => onOpenReport(report)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                >
                  Update Work Order
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
