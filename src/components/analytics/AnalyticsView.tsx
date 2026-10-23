import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingDown, 
  Droplets, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Download,
  Calendar,
  Layers
} from 'lucide-react';
import { LeakReport, Building } from '../../types/index.ts';

interface AnalyticsViewProps {
  reports: LeakReport[];
  buildings: Building[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  reports,
  buildings
}) => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  const totalWaterLoss = reports.reduce((acc, curr) => acc + (curr.waterLossLiters || 0), 0);
  const totalCostINR = reports.reduce((acc, curr) => acc + (curr.costLostINR || 0), 0);
  const resolvedCount = reports.filter(r => r.status === 'resolved' || r.status === 'closed').length;

  // Leak by type breakdown
  const typeMap: Record<string, { label: string; count: number; liters: number }> = {
    pipe_joint: { label: 'Pipe Joint / Coupling Seep', count: 0, liters: 0 },
    faucet: { label: 'Faucet / Basin Cartridge', count: 0, liters: 0 },
    flush_valve: { label: 'Flush Tank / Cistern Valve', count: 0, liters: 0 },
    ceiling_seepage: { label: 'Ceiling / Conduit Seepage', count: 0, liters: 0 },
    main_riser: { label: 'Main Supply Riser / Booster Line', count: 0, liters: 0 }
  };

  reports.forEach(r => {
    if (typeMap[r.leakType]) {
      typeMap[r.leakType].count += 1;
      typeMap[r.leakType].liters += r.waterLossLiters || 0;
    } else {
      typeMap.pipe_joint.count += 1;
      typeMap.pipe_joint.liters += r.waterLossLiters || 0;
    }
  });

  // Weekly Trend Mock
  const weeklyData = [
    { day: 'Mon', liters: 420, baseline: 800 },
    { day: 'Tue', liters: 580, baseline: 800 },
    { day: 'Wed', liters: 310, baseline: 800 },
    { day: 'Thu', liters: 940, baseline: 800 },
    { day: 'Fri', liters: 1250, baseline: 800 },
    { day: 'Sat', liters: 780, baseline: 800 },
    { day: 'Sun', liters: 640, baseline: 800 }
  ];

  const maxLiters = Math.max(...weeklyData.map(d => d.liters), 1500);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Campus Hydraulic Intelligence & Conservation Analytics
          </h2>
          <p className="text-xs text-slate-500">
            Comprehensive reporting on water loss, Mean Time to Resolve (MTTR), and component failure patterns.
          </p>
        </div>

        {/* Timeframe Filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            {(['7d', '30d', '90d', 'all'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  timeframe === t 
                    ? 'bg-white text-slate-900 shadow-xs font-semibold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === '7d' ? 'Last 7 Days' : t === '30d' ? 'Last 30 Days' : t === '90d' ? 'Quarter' : 'All Time'}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reports, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `leaklens_report_${Date.now()}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Water Conserved (Audit)</span>
            <Droplets className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            18,500 <span className="text-sm font-normal text-slate-500">L</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            Prevented via rapid isolation
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Mean Time to Resolve (MTTR)</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            4.8 <span className="text-sm font-normal text-slate-500">hours</span>
          </div>
          <div className="text-[11px] text-blue-600 font-medium mt-1">
            SLA compliance: 94.2%
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Mean Time to Detect (MTTD)</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            1.2 <span className="text-sm font-normal text-slate-500">hours</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Resident crowd-sourced reporting
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Estimated Tariff Lost</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            ₹{Math.round(totalCostINR)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across {reports.length} total recorded events
          </div>
        </div>
      </div>

      {/* Daily Water Loss Chart & Breakdown Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Bar Chart Visualization */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Daily Water Runoff Tracking (Litres)
              </h3>
              <p className="text-xs text-slate-500">
                Estimated daily volumetric loss against historical unmonitored baseline.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-blue-700 font-medium">
                <span className="w-2.5 h-2.5 rounded bg-blue-600" />
                Actual Incident Runoff
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded bg-slate-300" />
                Target Threshold
              </span>
            </div>
          </div>

          {/* Bar Chart Graphics */}
          <div className="mt-6 h-56 flex items-end gap-4 sm:gap-6 px-4 pb-2 border-b border-slate-200">
            {weeklyData.map(item => {
              const heightPercent = Math.round((item.liters / maxLiters) * 100);
              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] font-mono font-semibold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.liters}L
                  </span>
                  <div className="w-full max-w-[40px] bg-slate-100 rounded-t-sm h-full flex items-end relative overflow-hidden">
                    <div
                      className={`w-full rounded-t-sm transition-all duration-500 ${
                        item.liters > 1000 ? 'bg-red-500' : item.liters > 600 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-500 font-mono">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 px-2">
            <span>Calculated using dynamic duration * baseline flow assumptions</span>
            <span>Peak Day: <strong className="text-slate-800">Friday (1,250 L) — Main Riser Header Incident</strong></span>
          </div>
        </div>

        {/* Right Column (1/3): Component Breakdown */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Failure Mode Distribution
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Component breakdown by recorded incidence.
          </p>

          <div className="space-y-3">
            {Object.entries(typeMap).map(([key, item]) => (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className="font-mono text-slate-900 font-bold">{item.count}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${Math.max(10, (item.count / reports.length) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Estimated Loss</span>
                  <span className="font-mono">{Math.round(item.liters)} L</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
