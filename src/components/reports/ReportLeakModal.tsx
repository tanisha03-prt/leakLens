import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  AlertTriangle, 
  Droplet, 
  Building as BuildingIcon, 
  ShieldAlert, 
  CheckCircle2, 
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { Building, LeakSeverity, LeakType, User } from '../../types/index.ts';
import { detectDuplicateComplaint, LEAK_RATE_LPH } from '../../services/waterMath.ts';

interface ReportLeakModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildings: Building[];
  existingReports: any[];
  currentUser: User;
  onSubmitReport: (reportData: any) => Promise<any>;
}

export const ReportLeakModal: React.FC<ReportLeakModalProps> = ({
  isOpen,
  onClose,
  buildings,
  existingReports,
  currentUser,
  onSubmitReport
}) => {
  const [title, setTitle] = useState('');
  const [buildingId, setBuildingId] = useState(buildings[0]?.id || '');
  const [floor, setFloor] = useState<number>(3);
  const [roomOrZone, setRoomOrZone] = useState('');
  const [severity, setSeverity] = useState<LeakSeverity>('moderate');
  const [leakType, setLeakType] = useState<LeakType>('pipe_joint');
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string>('/src/assets/images/leak_pipe_dripping_1792652997799.jpg');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<any>(null);

  // Live duplicate detection
  useEffect(() => {
    if (buildingId && roomOrZone.trim().length >= 3) {
      const match = detectDuplicateComplaint(
        { buildingId, floor, roomOrZone, leakType },
        existingReports
      );
      if (match.isDuplicate) {
        setDuplicateWarning(match.matchedTicket);
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  }, [buildingId, floor, roomOrZone, leakType, existingReports]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !roomOrZone.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmitReport({
        title,
        description,
        buildingId,
        floor: Number(floor),
        roomOrZone,
        severity,
        leakType,
        photoUrl: photoPreview,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role
      });
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const selectedBuilding = buildings.find(b => b.id === buildingId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-5 py-4 bg-[#0B1F3A] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white">
              <Droplet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">
                Submit Smart Water Leakage Complaint
              </h3>
              <p className="text-[11px] text-blue-200">
                Reporting as {currentUser.name} ({currentUser.role})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Duplicate Warning Banner */}
        {duplicateWarning && (
          <div className="bg-amber-50 border-b border-amber-200 px-5 py-3 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-amber-900">
              <p className="font-semibold">
                Potential Duplicate Alert Detected ({duplicateWarning.ticketNumber})
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                An active ticket is already filed for <strong>{duplicateWarning.buildingName} Floor {floor} - {duplicateWarning.roomOrZone}</strong>. You may proceed if this is a distinct issue.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Incident Summary / Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Washbasin pipe joint leaking heavily, pooling on tiles"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Building, Floor, Zone Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campus Building *
              </label>
              <select
                value={buildingId}
                onChange={e => setBuildingId(e.target.value)}
                className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                {buildings.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Floor Level *
              </label>
              <select
                value={floor}
                onChange={e => setFloor(Number(e.target.value))}
                className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                {Array.from({ length: selectedBuilding?.totalFloors || 5 }, (_, i) => i + 1).map(f => (
                  <option key={f} value={f}>
                    Floor {f}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Room / Exact Zone *
              </label>
              <input
                type="text"
                required
                value={roomOrZone}
                onChange={e => setRoomOrZone(e.target.value)}
                placeholder="e.g. Washroom 302 / Room B-312"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Severity & Leak Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Leak Severity & Est. Flow Rate *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'minor', label: 'Minor Drip', rate: '0.8 L/h' },
                  { id: 'moderate', label: 'Steady Stream', rate: '18 L/h' },
                  { id: 'severe', label: 'Severe Flow', rate: '85 L/h' },
                  { id: 'critical', label: 'Critical Burst', rate: '320 L/h' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSeverity(item.id as LeakSeverity)}
                    className={`p-2 text-left rounded-md border text-xs transition-all ${
                      severity === item.id 
                        ? 'border-blue-600 bg-blue-50/60 font-semibold text-blue-900' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item.label}</span>
                      <span className="font-mono text-[10px] text-slate-500">{item.rate}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Component / Plumbing Type *
              </label>
              <select
                value={leakType}
                onChange={e => setLeakType(e.target.value as LeakType)}
                className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="pipe_joint">Pipe Joint / Coupling Seep</option>
                <option value="faucet">Faucet / Washbasin Tap</option>
                <option value="flush_valve">Flush Valve / Cistern Tank</option>
                <option value="ceiling_seepage">Ceiling Seepage / Slab Conduit</option>
                <option value="drain_overflow">Drain Overflow / Trap Clog</option>
                <option value="geyser_heater">Water Heater / Geyser Safety Valve</option>
                <option value="main_riser">Main Supply Riser / Booster Line</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Description & Observations *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe where water is flowing, if it is spraying, whether an isolation valve was found, and any structural hazards."
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Photo Upload with Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Photographic Evidence (Before Repair)
            </label>
            <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <img
                src={photoPreview}
                alt="Leak preview"
                referrerPolicy="no-referrer"
                className="w-16 h-16 object-cover rounded-md border border-slate-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-700 font-medium">
                  Upload actual photo or keep campus demonstration photo
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Visual proof ensures faster triage, correct tool procurement, and transparent resolution.
                </p>
                <label className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md cursor-pointer hover:bg-slate-50">
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Choose Image File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting...' : 'Register Complaint'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
