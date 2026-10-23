import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  CheckCircle2, 
  Wrench, 
  Droplet, 
  ShieldAlert, 
  Flame, 
  History, 
  UserCheck, 
  Camera, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { LeakReport, User, UserRole } from '../../types/index.ts';

interface IncidentDetailModalProps {
  report: LeakReport | null;
  onClose: () => void;
  currentUser: User;
  onAssignTechnician: (reportId: string, technicianId: string) => Promise<any>;
  onUpdateProgress: (reportId: string, payload: any) => Promise<any>;
  technicians: User[];
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  report,
  onClose,
  currentUser,
  onAssignTechnician,
  onUpdateProgress,
  technicians
}) => {
  if (!report) return null;

  const [activeTab, setActiveTab] = useState<'details' | 'photos' | 'timeline' | 'actions'>('details');
  const [selectedTechId, setSelectedTechId] = useState(technicians[0]?.id || '');
  const [repairNotes, setRepairNotes] = useState(report.assignment?.notes || '');
  const [partsInput, setPartsInput] = useState(report.assignment?.partsReplaced?.join(', ') || '');
  const [valveConfirmed, setValveConfirmed] = useState(report.assignment?.waterValveShutOff || false);
  const [hoursSpent, setHoursSpent] = useState(report.assignment?.hoursSpent || 1.5);
  const [resolutionPhoto, setResolutionPhoto] = useState(report.resolutionPhotoUrl || '/src/assets/images/repaired_pipe_clean_1792652998773.jpg');
  const [isUpdating, setIsUpdating] = useState(false);

  // Timeline steps
  const steps = [
    { label: 'Reported', completed: true, date: report.reportedAt },
    { label: 'Assigned', completed: Boolean(report.assignment || report.status !== 'reported'), date: report.assignment?.assignedAt },
    { label: 'In Progress', completed: report.status === 'in_progress' || report.status === 'resolved' || report.status === 'closed', date: report.assignment?.startedAt },
    { label: 'Resolved (Evidence)', completed: Boolean(report.resolvedAt || report.status === 'resolved' || report.status === 'closed'), date: report.resolvedAt }
  ];

  const handleAssign = async () => {
    setIsUpdating(true);
    try {
      await onAssignTechnician(report.id, selectedTechId);
      setIsUpdating(false);
    } catch {
      setIsUpdating(false);
    }
  };

  const handleProgressUpdate = async (status: 'in_progress' | 'resolved') => {
    setIsUpdating(true);
    try {
      const parts = partsInput.split(',').map(s => s.trim()).filter(Boolean);
      await onUpdateProgress(report.id, {
        status,
        notes: repairNotes,
        partsUsed: parts,
        waterValveShutOff: valveConfirmed,
        hoursSpent: Number(hoursSpent),
        evidencePhotoUrl: resolutionPhoto,
        actorName: currentUser.name,
        actorRole: currentUser.role
      });
      setIsUpdating(false);
    } catch {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-4 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="px-5 py-4 bg-[#0B1F3A] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-600 text-white">
              {report.ticketNumber}
            </span>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white truncate max-w-md">
                {report.title}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-blue-200 mt-0.5">
                <span>{report.buildingName}</span>
                <span>·</span>
                <span>Floor {report.floor} ({report.roomOrZone})</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 bg-slate-50 border-b border-slate-200 flex items-center gap-2 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-2.5 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'details' ? 'border-blue-600 text-blue-700 font-semibold' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Incident Details
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`py-2.5 px-3 border-b-2 font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'photos' ? 'border-blue-600 text-blue-700 font-semibold' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Before / After Evidence</span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-2.5 px-3 border-b-2 font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'timeline' ? 'border-blue-600 text-blue-700 font-semibold' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit & Timeline</span>
          </button>
          {(currentUser.role === 'admin' || currentUser.role === 'maintenance') && (
            <button
              onClick={() => setActiveTab('actions')}
              className={`py-2.5 px-3 border-b-2 font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'actions' ? 'border-blue-600 text-blue-700 font-semibold' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Technician Actions</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Status and Risk strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Current Status</div>
                  <div className="font-semibold text-slate-900 text-xs mt-0.5 capitalize">
                    {report.status.replace('_', ' ')}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Severity</div>
                  <div className="font-semibold text-slate-900 text-xs mt-0.5 capitalize">
                    {report.severity}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Calculated Risk</div>
                  <div className="font-mono font-bold text-xs mt-0.5 text-blue-700">
                    {report.riskScore}/100
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Water Loss Est.</div>
                  <div className="font-mono font-bold text-xs mt-0.5 text-blue-900">
                    {report.waterLossLiters} L (~₹{report.costLostINR})
                  </div>
                </div>
              </div>

              {/* Recurrence Warning if applicable */}
              {report.isRecurring && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5">
                  <Flame className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900">
                    <p className="font-semibold">
                      Recurring Failure Detected in Riser/Shaft ({report.recurrenceCount} previous reports)
                    </p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Historical reports reveal repeated pipe leaks at {report.buildingName} Floor {report.floor}. Structural riser replacement is advised rather than simple patch repairs.
                    </p>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-1">Incident Description</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded border border-slate-200">
                  {report.description}
                </p>
              </div>

              {/* Metadata details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded border border-slate-200 space-y-1.5">
                  <h4 className="font-bold text-slate-800 text-xs">Plumbing & Flow Specifications</h4>
                  <div className="flex justify-between text-slate-600">
                    <span>Component Type:</span>
                    <strong className="text-slate-800 capitalize">{report.leakType.replace('_', ' ')}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Baseline Flow Rate:</span>
                    <strong className="font-mono text-slate-800">{report.leakRateLph} L/hour</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Riser Identification:</span>
                    <strong className="font-mono text-slate-800">{report.plumbingShaftOrRiser || 'N/A'}</strong>
                  </div>
                </div>

                <div className="p-3 bg-white rounded border border-slate-200 space-y-1.5">
                  <h4 className="font-bold text-slate-800 text-xs">Assignment & Responsibility</h4>
                  <div className="flex justify-between text-slate-600">
                    <span>Reported By:</span>
                    <strong className="text-slate-800">{report.reportedBy.name} ({report.reportedBy.role})</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Assigned Technician:</span>
                    <strong className="text-slate-800">{report.assignment?.technicianName || 'Unassigned'}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Water Isolation Valve:</span>
                    <strong className={report.assignment?.waterValveShutOff ? 'text-emerald-700' : 'text-amber-700'}>
                      {report.assignment?.waterValveShutOff ? 'Confirmed Closed' : 'Open / Unverified'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BEFORE / AFTER PHOTOS */}
          {activeTab === 'photos' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Before Photo */}
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                  <div className="px-3 py-2 bg-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-between border-b border-slate-200">
                    <span>Before Repair (Reported Leak)</span>
                    <span className="text-[10px] text-slate-400 font-mono">Timestamped</span>
                  </div>
                  <div className="p-2">
                    <img
                      src={report.photoUrl}
                      alt="Before leak photo"
                      referrerPolicy="no-referrer"
                      className="w-full h-48 sm:h-60 object-cover rounded"
                    />
                  </div>
                  <div className="px-3 pb-3 text-[11px] text-slate-500">
                    Initial state of leak showing joint moisture and droplet runoff.
                  </div>
                </div>

                {/* After Photo / Evidence */}
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                  <div className="px-3 py-2 bg-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-between border-b border-slate-200">
                    <span>After Resolution Evidence Photo</span>
                    {report.resolutionPhotoUrl ? (
                      <span className="text-[10px] text-emerald-600 font-bold">Verified</span>
                    ) : (
                      <span className="text-[10px] text-amber-600 font-medium">Pending Closure</span>
                    )}
                  </div>
                  <div className="p-2">
                    {report.resolutionPhotoUrl ? (
                      <img
                        src={report.resolutionPhotoUrl}
                        alt="Repaired plumbing evidence"
                        referrerPolicy="no-referrer"
                        className="w-full h-48 sm:h-60 object-cover rounded border border-emerald-300"
                      />
                    ) : (
                      <div className="w-full h-48 sm:h-60 rounded bg-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                        <Camera className="w-8 h-8 mb-2 text-slate-300" />
                        <span className="text-xs font-medium">No resolution photo submitted yet</span>
                        <span className="text-[11px] mt-1 text-slate-400">
                          Maintenance technician must upload photo proof before closing this complaint.
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="px-3 pb-3 text-[11px] text-slate-500">
                    {report.assignment?.partsReplaced && report.assignment.partsReplaced.length > 0 && (
                      <div className="mt-1">
                        <strong>Parts Replaced:</strong> {report.assignment.partsReplaced.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TIMELINE & AUDIT */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800">Status Progression Timeline</h4>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {steps.map((st, idx) => (
                    <div key={idx} className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          st.completed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {st.completed ? '✓' : idx + 1}
                        </div>
                        <span className={`text-xs font-semibold ${st.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                          {st.label}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {st.date ? new Date(st.date).toLocaleDateString() : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2">Immutable Incident Audit Log</h4>
                <div className="bg-white rounded border border-slate-200 divide-y divide-slate-100 text-xs">
                  <div className="p-2.5 flex items-start justify-between text-slate-600">
                    <div>
                      <strong className="text-slate-800">LEAK_REPORTED</strong>: Filed with photo proof
                      <div className="text-[11px] text-slate-400">By {report.reportedBy.name} ({report.reportedBy.role})</div>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">{new Date(report.reportedAt).toLocaleDateString()}</span>
                  </div>
                  {report.assignment && (
                    <div className="p-2.5 flex items-start justify-between text-slate-600">
                      <div>
                        <strong className="text-slate-800">TECHNICIAN_ASSIGNED</strong>: Assigned to {report.assignment.technicianName}
                        <div className="text-[11px] text-slate-400">{report.assignment.notes || 'Dispatched for site triage'}</div>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">{new Date(report.assignment.assignedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  {report.resolvedAt && (
                    <div className="p-2.5 flex items-start justify-between text-slate-600">
                      <div>
                        <strong className="text-emerald-700">REPAIR_RESOLVED_EVIDENCE</strong>: Closed with after photo
                        <div className="text-[11px] text-slate-400">Verified dry under full system pressure</div>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">{new Date(report.resolvedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACTIONS (ADMIN / STAFF) */}
          {activeTab === 'actions' && (
            <div className="space-y-4">
              {/* Assignment Form */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800">Dispatch / Reassign Technician</h4>
                <div className="flex items-center gap-3">
                  <select
                    value={selectedTechId}
                    onChange={e => setSelectedTechId(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded bg-white"
                  >
                    {technicians.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} — {t.specialty || 'General Plumber'}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssign}
                    disabled={isUpdating}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:opacity-50"
                  >
                    {isUpdating ? 'Assigning...' : 'Confirm Assignment'}
                  </button>
                </div>
              </div>

              {/* Work Progress & Resolution Evidence Form */}
              <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800">Log Maintenance Work & Evidence</h4>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Technician Repair Notes
                  </label>
                  <textarea
                    rows={2}
                    value={repairNotes}
                    onChange={e => setRepairNotes(e.target.value)}
                    placeholder="Describe diagnosis, isolation steps, and pipe seal replacement..."
                    className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Parts Used (comma separated)
                    </label>
                    <input
                      type="text"
                      value={partsInput}
                      onChange={e => setPartsInput(e.target.value)}
                      placeholder="e.g. 1/2 brass valve, Teflon tape, rubber gasket"
                      className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Work Hours Logged
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={hoursSpent}
                      onChange={e => setHoursSpent(Number(e.target.value))}
                      className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded"
                    />
                  </div>
                </div>

                {/* Valve Checkbox */}
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={valveConfirmed}
                    onChange={e => setValveConfirmed(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600"
                  />
                  <span>Isolation stopcock/valve verified shut off during work</span>
                </label>

                {/* Buttons to update or resolve */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    onClick={() => handleProgressUpdate('in_progress')}
                    disabled={isUpdating}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                  >
                    Save as In-Progress
                  </button>

                  <button
                    onClick={() => handleProgressUpdate('resolved')}
                    disabled={isUpdating}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resolve with Evidence</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Ticket ID: <strong className="font-mono text-slate-700">{report.id}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
