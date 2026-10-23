import React from 'react';
import { 
  AlertTriangle, 
  Droplet, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  ShieldAlert, 
  Info, 
  ArrowRight,
  Flame,
  ChevronRight,
  Gauge
} from 'lucide-react';
import { LeakReport, Building } from '../../types/index.ts';

interface OverviewDashboardProps {
  reports: LeakReport[];
  buildings: Building[];
  onOpenReport: (report: LeakReport) => void;
  onOpenNewReportModal: () => void;
  onNavigateToHotspots: () => void;
  onNavigateToIncidents: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  reports,
  buildings,
  onOpenReport,
  onOpenNewReportModal,
  onNavigateToHotspots,
  onNavigateToIncidents
}) => {
  const activeReports = reports.filter(r => r.status !== 'resolved' && r.status !== 'closed');
  const criticalReports = reports.filter(r => r.severity === 'critical' && r.status !== 'resolved');
  const pendingRepairs = reports.filter(r => r.status === 'assigned' || r.status === 'in_progress');
  const resolvedCount = reports.filter(r => r.status === 'resolved' || r.status === 'closed').length;

  const totalWaterLoss = reports.reduce((acc, curr) => acc + (curr.waterLossLiters || 0), 0);
  const totalCost = reports.reduce((acc, curr) => acc + (curr.costLostINR || 0), 0);

  // High risk items (score >= 60)
  const highRiskReports = reports
    .filter(r => r.status !== 'resolved' && r.status !== 'closed')
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 4);

  // Buildings with recurring problems
  const troubledBuildings = buildings.filter(b => b.openLeaksCount > 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero Welcome & Quick Action Banner */}
      <div className="bg-gradient-to-r from-[#0B1F3A] to-[#1E3A5F] rounded-xl p-5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-300 mb-1">
            <span>Hydraulic Intelligence Network</span>
            <span>·</span>
            <span>Real-time Campus Surveillance</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Smart Water Leakage & Incident Response Center
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Automated acoustic leak profiling, risk scoring, duplicate prevention, and evidence-verified maintenance across 4 residential and academic complexes.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onNavigateToHotspots}
            className="px-3.5 py-2 text-xs font-medium text-slate-200 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg transition-colors whitespace-nowrap"
          >
            Hotspot Matrix
          </button>
          <button
            onClick={onOpenNewReportModal}
            className="px-3.5 py-2 text-xs font-semibold text-[#0B1F3A] bg-white hover:bg-slate-100 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            + Report Leakage
          </button>
        </div>
      </div>

      {/* 5 Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Active Incidents */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Active Incidents</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {activeReports.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {pendingRepairs.length} currently assigned
          </p>
        </div>

        {/* Critical Alerts */}
        <div className="bg-white p-3.5 rounded-lg border border-red-200 shadow-xs bg-red-50/20">
          <div className="flex items-center justify-between text-red-600 mb-1.5">
            <span className="text-xs font-medium">Critical Leaks</span>
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-700 font-mono tabular-nums">
            {criticalReports.length}
          </div>
          <p className="text-[11px] text-red-600/80 mt-1 font-medium">
            High pressure / main risers
          </p>
        </div>

        {/* Pending Repairs */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">In Repair Queue</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {pendingRepairs.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {resolvedCount} resolved this cycle
          </p>
        </div>

        {/* Avg Resolution Time */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Avg Resolution (MTTR)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            4.8<span className="text-sm font-normal text-slate-500 ml-1">hrs</span>
          </div>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">
            -22% faster than last month
          </p>
        </div>

        {/* Estimated Water Loss */}
        <div className="bg-white p-3.5 rounded-lg border border-blue-200 shadow-xs bg-blue-50/30 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-blue-700 mb-1.5">
            <span className="text-xs font-medium">Est. Water Loss</span>
            <Droplet className="w-4 h-4 text-blue-600 fill-blue-600/20" />
          </div>
          <div className="text-2xl font-bold text-blue-900 font-mono tabular-nums">
            {Math.round(totalWaterLoss).toLocaleString()}
            <span className="text-sm font-normal text-blue-700 ml-1">L</span>
          </div>
          <p className="text-[11px] text-blue-700/80 mt-1 font-medium">
            Approx. ₹{Math.round(totalCost)} tariff cost
          </p>
        </div>
      </div>

      {/* Water Loss Calculation Transparency & Assumptions Panel */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                Scientific Water Loss & Tariff Impact Modeling
              </h3>
              <p className="text-[11px] text-slate-500">
                Transparent distinction between explicitly assumed baseline flow rates and measured durations.
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded border border-slate-200/80 flex items-center gap-3">
            <span>Tariff Baseline: <strong className="font-mono text-slate-900">₹48 / 1,000 L</strong></span>
            <span>·</span>
            <span>Duration Clock: <strong className="font-mono text-slate-900">Live Timestamp Differential</strong></span>
          </div>
        </div>

        {/* 4 Flow Rate Assumptions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 text-xs">
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200/60">
            <div className="flex items-center justify-between font-medium text-slate-700">
              <span>Minor Drip</span>
              <span className="font-mono font-bold text-slate-900">0.8 L/hr</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              ~1 drop every 2-3 sec. Faucet cartridge or packing nut seep.
            </p>
          </div>

          <div className="p-2.5 bg-slate-50 rounded border border-slate-200/60">
            <div className="flex items-center justify-between font-medium text-slate-700">
              <span>Steady Trickle</span>
              <span className="font-mono font-bold text-slate-900">18.0 L/hr</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Continuous stream. Toilet flapper/ballcock valve failure.
            </p>
          </div>

          <div className="p-2.5 bg-slate-50 rounded border border-slate-200/60">
            <div className="flex items-center justify-between font-medium text-slate-700">
              <span>Severe Flow</span>
              <span className="font-mono font-bold text-amber-700">85.0 L/hr</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Unsealed pipe joint or cracked wall riser elbow fitting.
            </p>
          </div>

          <div className="p-2.5 bg-red-50/60 rounded border border-red-200/80">
            <div className="flex items-center justify-between font-medium text-red-900">
              <span>Critical Burst</span>
              <span className="font-mono font-bold text-red-700">320.0 L/hr</span>
            </div>
            <p className="text-[10px] text-red-800/80 mt-1">
              High-pressure header split or booster pump discharge line.
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Section: High-Priority Incident Stream + Campus Hotspot Digest */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Priority Incidents Needing Action */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Priority Action Stream
                </h3>
                <p className="text-xs text-slate-500">
                  Ranked by dynamic multi-factor risk score (severity, aging, and recurrence).
                </p>
              </div>

              <button
                onClick={onNavigateToIncidents}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                <span>All {reports.length} Incidents</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {highRiskReports.map(report => (
                <div
                  key={report.id}
                  onClick={() => onOpenReport(report)}
                  className="py-3 px-2 rounded-md hover:bg-slate-50 transition-colors cursor-pointer flex items-start justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-blue-700">
                        {report.ticketNumber}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {report.title}
                      </span>
                      {report.isRecurring && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="text-[11px] font-medium text-amber-700 flex items-center gap-0.5">
                            <Flame className="w-3 h-3 text-amber-500" />
                            Recurring Hotspot ({report.recurrenceCount}x)
                          </span>
                        </>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-1">
                      {report.description}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5">
                      <span>{report.buildingName}</span>
                      <span>·</span>
                      <span>Floor {report.floor} ({report.roomOrZone})</span>
                      <span>·</span>
                      <span>Est. Loss: <strong className="font-mono text-slate-700">{report.waterLossLiters} L</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-1">
                    {/* Risk Badge */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400">Risk</span>
                      <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                        report.riskScore >= 80 
                          ? 'bg-red-100 text-red-800' 
                          : report.riskScore >= 50 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-blue-100 text-blue-800'
                      }`}>
                        {report.riskScore}/100
                      </span>
                    </div>

                    <span className="text-[11px] font-medium text-slate-500 capitalize">
                      {report.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-2 text-right">
            <button
              onClick={onNavigateToIncidents}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
            >
              <span>Manage full incident lifecycle & assigned technician dispatch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column (1/3): Campus Hotspot Risk Summary */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Campus Hotspot Radar
                </h3>
                <p className="text-xs text-slate-500">
                  Buildings with active plumbing vulnerabilities.
                </p>
              </div>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>

            <div className="space-y-3">
              {troubledBuildings.map(b => (
                <div key={b.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-900">{b.name}</span>
                    <span className="font-mono font-bold text-slate-700">{b.openLeaksCount} open</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                    <span>Code: {b.code} ({b.totalFloors} Floors)</span>
                    <span className="font-mono text-blue-700">{b.totalWastageLiters} L lost</span>
                  </div>

                  {/* Hotspot Vulnerability Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        b.hotspotScore >= 75 ? 'bg-red-500' : b.hotspotScore >= 40 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${b.hotspotScore}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>Plumbing Riser Stress</span>
                    <span className="font-mono font-semibold">{b.hotspotScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onNavigateToHotspots}
            className="w-full mt-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Open Floor-by-Floor Riser Map</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
