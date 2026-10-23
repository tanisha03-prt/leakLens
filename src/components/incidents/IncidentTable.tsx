import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  AlertTriangle, 
  Flame, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Wrench,
  Clock
} from 'lucide-react';
import { LeakReport, Building, UserRole } from '../../types/index.ts';

interface IncidentTableProps {
  reports: LeakReport[];
  buildings: Building[];
  currentRole: UserRole;
  onOpenReport: (report: LeakReport) => void;
  onOpenNewReport: () => void;
}

export const IncidentTable: React.FC<IncidentTableProps> = ({
  reports,
  buildings,
  currentRole,
  onOpenReport,
  onOpenNewReport
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [buildingFilter, setBuildingFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'risk' | 'date' | 'water'>('risk');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter & Sort
  const filteredReports = useMemo(() => {
    let result = [...reports];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r => 
        r.ticketNumber.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.roomOrZone.toLowerCase().includes(q) ||
        r.buildingName.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(r => r.status === statusFilter);
    }

    if (severityFilter !== 'all') {
      result = result.filter(r => r.severity === severityFilter);
    }

    if (buildingFilter !== 'all') {
      result = result.filter(r => r.buildingId === buildingFilter);
    }

    result.sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortBy === 'risk') {
        valA = a.riskScore;
        valB = b.riskScore;
      } else if (sortBy === 'water') {
        valA = a.waterLossLiters;
        valB = b.waterLossLiters;
      } else if (sortBy === 'date') {
        valA = new Date(a.reportedAt).getTime();
        valB = new Date(b.reportedAt).getTime();
      }
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });

    return result;
  }, [reports, search, statusFilter, severityFilter, buildingFilter, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage) || 1;
  const paginatedReports = filteredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSort = (field: 'risk' | 'date' | 'water') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <span className="text-red-700 font-semibold text-xs">Critical</span>;
      case 'severe':
        return <span className="text-amber-700 font-semibold text-xs">Severe</span>;
      case 'moderate':
        return <span className="text-blue-700 font-medium text-xs">Moderate</span>;
      case 'minor':
      default:
        return <span className="text-slate-600 font-normal text-xs">Minor</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return <span className="text-emerald-700 font-medium text-xs">Resolved</span>;
      case 'in_progress':
        return <span className="text-blue-700 font-medium text-xs">In Progress</span>;
      case 'assigned':
        return <span className="text-amber-700 font-medium text-xs">Assigned</span>;
      case 'reported':
      default:
        return <span className="text-slate-500 font-normal text-xs">Reported</span>;
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Header & Controls Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Incident Intelligence Registry
          </h2>
          <p className="text-xs text-slate-500">
            Real-time multi-building leak queue with risk prioritization and resolution evidence tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search ticket, room, zone..."
              className="text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-48 sm:w-60 bg-white"
            />
          </div>

          <button
            onClick={onOpenNewReport}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors whitespace-nowrap"
          >
            + New Incident
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white px-4 py-2.5 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs px-2 py-1 border border-slate-200 rounded bg-slate-50 text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="reported">Reported</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={e => { setSeverityFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs px-2 py-1 border border-slate-200 rounded bg-slate-50 text-slate-700 focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="severe">Severe</option>
            <option value="moderate">Moderate</option>
            <option value="minor">Minor</option>
          </select>

          {/* Building Filter */}
          <select
            value={buildingFilter}
            onChange={e => { setBuildingFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs px-2 py-1 border border-slate-200 rounded bg-slate-50 text-slate-700 focus:outline-none"
          >
            <option value="all">All Buildings</option>
            {buildings.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="text-slate-500 text-xs font-mono">
          Showing <span className="font-bold text-slate-900">{filteredReports.length}</span> recorded complaints
        </div>
      </div>

      {/* High Density Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold select-none">
                <th className="py-2.5 px-3">Ticket</th>
                <th className="py-2.5 px-3">Location & Riser</th>
                <th className="py-2.5 px-3">Incident Summary</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Status</th>
                <th 
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900"
                  onClick={() => toggleSort('water')}
                >
                  <div className="inline-flex items-center gap-1">
                    <span>Est. Loss</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900"
                  onClick={() => toggleSort('risk')}
                >
                  <div className="inline-flex items-center gap-1">
                    <span>Risk Score</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedReports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No incidents match your current filter parameters.
                  </td>
                </tr>
              ) : (
                paginatedReports.map(report => (
                  <tr 
                    key={report.id}
                    className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                    onClick={() => onOpenReport(report)}
                  >
                    {/* Ticket */}
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {report.ticketNumber}
                    </td>

                    {/* Location */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{report.buildingName}</div>
                      <div className="text-[11px] text-slate-500">
                        Floor {report.floor} · {report.roomOrZone}
                      </div>
                    </td>

                    {/* Summary */}
                    <td className="py-2.5 px-3 max-w-xs">
                      <div className="font-medium text-slate-800 truncate">{report.title}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 truncate">
                        <span>Reported by {report.reportedBy.name}</span>
                        {report.isRecurring && (
                          <span className="text-amber-700 font-semibold flex items-center gap-0.5">
                            <Flame className="w-3 h-3 text-amber-500" />
                            Recurrence ({report.recurrenceCount}x)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Severity */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {getSeverityBadge(report.severity)}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {getStatusBadge(report.status)}
                    </td>

                    {/* Est Loss */}
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                      <span className="font-semibold text-slate-800">
                        {report.waterLossLiters} L
                      </span>
                      <div className="text-[10px] text-slate-400">
                        ₹{report.costLostINR}
                      </div>
                    </td>

                    {/* Risk Score */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                        report.riskScore >= 80 
                          ? 'bg-red-100 text-red-800' 
                          : report.riskScore >= 50 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-blue-100 text-blue-800'
                      }`}>
                        {report.riskScore}/100
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => { e.stopPropagation(); onOpenReport(report); }}
                        className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                        title="View Incident Dossier"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Page <span className="font-mono font-bold">{currentPage}</span> of <span className="font-mono font-bold">{totalPages}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 border border-slate-300 rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 border border-slate-300 rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
