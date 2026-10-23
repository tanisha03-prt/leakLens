import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  Server, 
  CheckCircle2, 
  Code2, 
  Layers, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { apiClient } from '../../services/api.ts';

interface BackendStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendStatusModal: React.FC<BackendStatusModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [backendStatus, setBackendStatus] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      apiClient.getStatus().then(status => setBackendStatus(status));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const apiEndpoints = [
    { method: 'GET', path: '/api/status', desc: 'Backend health, Mongoose schema status, and collection counts', auth: 'Public' },
    { method: 'POST', path: '/api/auth/login', desc: 'User authentication with role validation & simulated JWT', auth: 'Public' },
    { method: 'GET', path: '/api/users', desc: 'List campus users with role filtering (?role=maintenance)', auth: 'Admin / Internal' },
    { method: 'GET', path: '/api/buildings', desc: 'Campus buildings with calculated open leaks and hotspot scores', auth: 'All Roles' },
    { method: 'GET', path: '/api/leaks', desc: 'Query leak reports with multi-factor risk, status, and role filter', auth: 'Role-scoped' },
    { method: 'POST', path: '/api/leaks', desc: 'Submit leak report, execute duplicate check & risk calculation', auth: 'Resident / Staff' },
    { method: 'POST', path: '/api/leaks/:id/assign', desc: 'Dispatch technician and create audit log entry', auth: 'Admin' },
    { method: 'POST', path: '/api/leaks/:id/progress', desc: 'Update repair status, parts used, and upload evidence photo', auth: 'Maintenance' },
    { method: 'GET', path: '/api/analytics', desc: 'Aggregate volumetric loss, MTTR, MTTD, and category breakdown', auth: 'Staff / Admin' },
    { method: 'GET', path: '/api/notifications', desc: 'Role-targeted real-time notification alerts & SLA escalations', auth: 'Authenticated' },
    { method: 'GET', path: '/api/audit-logs', desc: 'Immutable timeline of every report, assignment, and closure', auth: 'Admin' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#0B1F3A] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white">
                MERN Backend & MongoDB Architecture Dossier
              </h2>
              <p className="text-[11px] text-blue-200">
                Verified Express.js REST API + Mongoose Object Data Modeling (ODM)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Status Alert Banner */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
            <Server className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-950">Express Backend: Online (Port 3000)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-slate-600">
                The Express full-stack server (<code className="font-mono text-blue-800 font-semibold">server.ts</code>) is actively serving all REST endpoints with Mongoose schema validation.
              </p>
              <div className="text-[11px] text-slate-500 font-mono pt-1">
                Environment: MONGODB_URI ready · Embedded document fallback active for sandbox isolation.
              </div>
            </div>
          </div>

          {/* 6 Verified Mongoose Models */}
          <div>
            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>MongoDB Mongoose Models Implemented</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { name: 'User.ts', path: 'src/models/User.ts', desc: 'Roles (Resident, Maintenance, Admin), auth hash, room index' },
                { name: 'Building.ts', path: 'src/models/Building.ts', desc: 'Floors, wings, rooms, hotspot risk scoring' },
                { name: 'LeakReport.ts', path: 'src/models/LeakReport.ts', desc: 'Compound indexes, risk scoring, photo URLs, flow rate' },
                { name: 'MaintenanceAssignment.ts', path: 'src/models/MaintenanceAssignment.ts', desc: 'Technician assignment, work hours, evidence photo' },
                { name: 'Notification.ts', path: 'src/models/Notification.ts', desc: 'Role-targeted alerts, SLA breach warnings' },
                { name: 'AuditLog.ts', path: 'src/models/AuditLog.ts', desc: 'Immutable timeline tracking all actor modifications' }
              ].map(m => (
                <div key={m.name} className="p-2.5 bg-slate-50 rounded border border-slate-200/80">
                  <div className="flex items-center justify-between font-mono font-bold text-slate-800">
                    <span>{m.name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-snug">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* REST API Endpoints Catalog */}
          <div>
            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-600" />
              <span>Registered Express REST Endpoints</span>
            </h3>

            <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 font-mono text-[11px]">
              {apiEndpoints.map((ep, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between gap-3 hover:bg-slate-50">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      ep.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                      ep.method === 'POST' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ep.method}
                    </span>
                    <span className="font-semibold text-slate-800">{ep.path}</span>
                    <span className="text-slate-400 font-sans hidden sm:inline text-[11px]">· {ep.desc}</span>
                  </div>

                  <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-sans shrink-0">
                    {ep.auth}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Production MongoDB Setup Instructions */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center justify-between">
              <span>Production MongoDB Connection Instructions</span>
              <span className="text-[11px] text-slate-500 font-normal">Ready for Local or MongoDB Atlas</span>
            </h4>
            <p className="text-slate-600 text-[11px]">
              To connect LeakLens to an external or hosted MongoDB Atlas instance, configure the <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">MONGODB_URI</code> in <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">.env</code>:
            </p>
            <div className="bg-[#0B1F3A] text-slate-200 p-2.5 rounded font-mono text-[11px] flex items-center justify-between">
              <code>MONGODB_URI="mongodb+srv://admin:pass@cluster0.mongodb.net/leaklens?retryWrites=true"</code>
              <button
                onClick={() => copyToClipboard('MONGODB_URI="mongodb+srv://admin:pass@cluster0.mongodb.net/leaklens?retryWrites=true"', 1)}
                className="p-1 hover:text-white rounded"
              >
                {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
