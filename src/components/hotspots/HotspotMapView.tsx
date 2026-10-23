import React, { useState } from 'react';
import { 
  Building as BuildingIcon, 
  MapPin, 
  Flame, 
  AlertTriangle, 
  Layers, 
  CheckCircle2, 
  Droplet,
  ChevronRight,
  Info
} from 'lucide-react';
import { Building, LeakReport } from '../../types/index.ts';

interface HotspotMapViewProps {
  buildings: Building[];
  reports: LeakReport[];
  onOpenReport: (report: LeakReport) => void;
}

export const HotspotMapView: React.FC<HotspotMapViewProps> = ({
  buildings,
  reports,
  onOpenReport
}) => {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(buildings[0]?.id || '');
  const [selectedFloor, setSelectedFloor] = useState<number>(3);

  const activeBuilding = buildings.find(b => b.id === selectedBuildingId) || buildings[0];

  // Reports matching current building and floor
  const floorReports = reports.filter(
    r => r.buildingId === activeBuilding?.id && r.floor === selectedFloor
  );

  // Recurrence alerts in this building
  const buildingRecurrences = reports.filter(
    r => r.buildingId === activeBuilding?.id && (r.isRecurring || r.recurrenceCount > 0)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Floor-by-Floor Riser & Hotspot Matrix
          </h2>
          <p className="text-xs text-slate-500">
            Interactive structural plumbing diagnostic map highlighting recurring hydraulic stress points.
          </p>
        </div>

        {/* Building Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Building:</span>
          <select
            value={selectedBuildingId}
            onChange={e => {
              setSelectedBuildingId(e.target.value);
              setSelectedFloor(1);
            }}
            className="text-xs font-semibold px-3 py-1.5 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {buildings.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.openLeaksCount} active leaks)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Floor View Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Floor Level Selector & Building Specs */}
        <div className="space-y-4 lg:col-span-1">
          {/* Floor Selector Card */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span>Select Floor Level</span>
              <Layers className="w-3.5 h-3.5 text-blue-600" />
            </h3>

            <div className="space-y-1">
              {Array.from({ length: activeBuilding?.totalFloors || 5 }, (_, idx) => {
                const floorNum = (activeBuilding?.totalFloors || 5) - idx;
                const countOnFloor = reports.filter(
                  r => r.buildingId === activeBuilding?.id && r.floor === floorNum && r.status !== 'resolved'
                ).length;
                const isSelected = selectedFloor === floorNum;

                return (
                  <button
                    key={floorNum}
                    onClick={() => setSelectedFloor(floorNum)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      isSelected 
                        ? 'bg-blue-600 text-white font-semibold shadow-xs' 
                        : 'text-slate-700 hover:bg-slate-100 bg-slate-50/60'
                    }`}
                  >
                    <span>Level {floorNum} Floor</span>
                    {countOnFloor > 0 ? (
                      <span className={`px-1.5 py-0.2 rounded font-mono font-bold text-[10px] ${
                        isSelected ? 'bg-white text-blue-800' : 'bg-red-100 text-red-700'
                      }`}>
                        {countOnFloor} {countOnFloor === 1 ? 'leak' : 'leaks'}
                      </span>
                    ) : (
                      <span className={`text-[10px] font-mono ${isSelected ? 'text-blue-100' : 'text-emerald-600'}`}>
                        Nominal
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Building Profile Card */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <img
              src="/src/assets/images/campus_hostel_exterior_1792652999933.jpg"
              alt="Campus facility"
              referrerPolicy="no-referrer"
              className="w-full h-28 object-cover"
            />
            <div className="p-3 text-xs space-y-2">
              <div className="font-bold text-slate-900">{activeBuilding.name}</div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Type:</span>
                <span className="capitalize text-slate-700 font-medium">{activeBuilding.type}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Total Rooms:</span>
                <span className="font-mono text-slate-700">{activeBuilding.totalRooms} rooms</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Plumbing Risk Index:</span>
                <span className="font-mono font-bold text-red-600">{activeBuilding.hotspotScore}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (3/4): Interactive Architectural 2D Floor Plan Schematic */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {activeBuilding.name} — Level {selectedFloor} Schematic
                </h3>
                <p className="text-xs text-slate-500">
                  Click on any hydraulic node or leak marker to open detailed diagnostic records.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Riser Shaft
                </span>
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  Active Leak
                </span>
              </div>
            </div>

            {/* Interactive 2D Blueprint Grid */}
            <div className="mt-4 p-6 bg-slate-50 rounded-xl border border-slate-200 relative overflow-hidden min-h-[380px] flex flex-col justify-between">
              {/* Floor Plan Header Corridor */}
              <div className="grid grid-cols-4 gap-3 text-center text-xs">
                {/* West Wing Rooms */}
                <div className="p-3 bg-white rounded border border-slate-300 shadow-xs relative">
                  <span className="font-semibold text-slate-700">Room {selectedFloor}01 - {selectedFloor}05</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">West Wing Resident Quarters</p>
                </div>

                {/* West Washroom & Shaft W */}
                <div className="p-3 bg-blue-50/50 rounded border border-blue-300 relative">
                  <span className="font-semibold text-blue-900">Washroom {selectedFloor}02 (West)</span>
                  <div className="mt-1 flex items-center justify-center gap-1 text-[10px] font-mono text-blue-700">
                    <span className="w-2 h-2 rounded bg-blue-600 inline-block" />
                    <span>Shaft W-{selectedFloor}</span>
                  </div>

                  {/* Check if any leak matches this room */}
                  {floorReports.filter(r => r.roomOrZone.toLowerCase().includes('302') || r.roomOrZone.toLowerCase().includes('west')).map(r => (
                    <button
                      key={r.id}
                      onClick={() => onOpenReport(r)}
                      className="mt-2 w-full py-1 px-2 bg-red-600 hover:bg-red-700 text-white font-mono text-[11px] font-bold rounded shadow-sm flex items-center justify-center gap-1 transition-transform transform active:scale-95"
                    >
                      <AlertTriangle className="w-3 h-3 text-white" />
                      <span>{r.ticketNumber} ({r.severity})</span>
                    </button>
                  ))}
                </div>

                {/* Central Utility Duct & Stairwell */}
                <div className="p-3 bg-slate-100 rounded border border-slate-300 relative flex flex-col items-center justify-center">
                  <span className="font-semibold text-slate-700">Main Central Core</span>
                  <span className="text-[10px] text-slate-500">Stairwell & Electrical Trunk</span>
                </div>

                {/* East Washroom & Shaft E */}
                <div className="p-3 bg-blue-50/50 rounded border border-blue-300 relative">
                  <span className="font-semibold text-blue-900">Washroom {selectedFloor}04 (East)</span>
                  <div className="mt-1 flex items-center justify-center gap-1 text-[10px] font-mono text-blue-700">
                    <span className="w-2 h-2 rounded bg-blue-600 inline-block" />
                    <span>Shaft E-{selectedFloor}</span>
                  </div>

                  {floorReports.filter(r => r.roomOrZone.toLowerCase().includes('204') || r.roomOrZone.toLowerCase().includes('east')).map(r => (
                    <button
                      key={r.id}
                      onClick={() => onOpenReport(r)}
                      className="mt-2 w-full py-1 px-2 bg-amber-600 hover:bg-amber-700 text-white font-mono text-[11px] font-bold rounded shadow-sm flex items-center justify-center gap-1 transition-transform"
                    >
                      <AlertTriangle className="w-3 h-3 text-white" />
                      <span>{r.ticketNumber}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Central Walking Corridor */}
              <div className="my-4 py-2 px-4 bg-slate-200/80 rounded border border-dashed border-slate-300 text-center text-[11px] font-mono text-slate-500 tracking-wider uppercase">
                Level {selectedFloor} Primary Distribution Corridor — Main Water Isolation Valve At Column C3
              </div>

              {/* Bottom Row Rooms */}
              <div className="grid grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3 bg-white rounded border border-slate-300 shadow-xs">
                  <span className="font-semibold text-slate-700">Room {selectedFloor}06 - {selectedFloor}10</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Southwest Bay</p>
                </div>
                <div className="p-3 bg-white rounded border border-slate-300 shadow-xs">
                  <span className="font-semibold text-slate-700">Room {selectedFloor}11 - {selectedFloor}15</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">South Central Bay</p>
                </div>
                <div className="p-3 bg-white rounded border border-slate-300 shadow-xs">
                  <span className="font-semibold text-slate-700">HVAC Fan Coil Closet</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Drainage Sump Pump</p>
                </div>
                <div className="p-3 bg-white rounded border border-slate-300 shadow-xs">
                  <span className="font-semibold text-slate-700">Room {selectedFloor}16 - {selectedFloor}20</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Southeast Bay</p>
                </div>
              </div>
            </div>

            {/* List of active complaints on this floor */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 mb-2">
                Floor {selectedFloor} Complaints Register ({floorReports.length} incidents)
              </h4>
              {floorReports.length === 0 ? (
                <div className="text-xs text-slate-500 py-3 bg-slate-50 rounded text-center">
                  Zero active leaks reported on Level {selectedFloor}. All risers and supply pipes operating nominally.
                </div>
              ) : (
                <div className="space-y-2">
                  {floorReports.map(report => (
                    <div
                      key={report.id}
                      onClick={() => onOpenReport(report)}
                      className="p-3 bg-slate-50 hover:bg-blue-50/50 rounded-lg border border-slate-200 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-blue-700">
                          {report.ticketNumber}
                        </span>
                        <div>
                          <div className="font-medium text-xs text-slate-900">{report.title}</div>
                          <div className="text-[11px] text-slate-500">{report.roomOrZone} · {report.severity}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-700">
                          {report.waterLossLiters} L
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
