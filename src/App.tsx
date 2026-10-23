import React, { useState, useEffect } from 'react';
import { 
  Navbar 
} from './components/layout/Navbar.tsx';
import { 
  Sidebar 
} from './components/layout/Sidebar.tsx';
import { 
  OverviewDashboard 
} from './components/dashboard/OverviewDashboard.tsx';
import { 
  IncidentTable 
} from './components/incidents/IncidentTable.tsx';
import { 
  IncidentDetailModal 
} from './components/incidents/IncidentDetailModal.tsx';
import { 
  ReportLeakModal 
} from './components/reports/ReportLeakModal.tsx';
import { 
  HotspotMapView 
} from './components/hotspots/HotspotMapView.tsx';
import { 
  AnalyticsView 
} from './components/analytics/AnalyticsView.tsx';
import { 
  MaintenanceDesk 
} from './components/maintenance/MaintenanceDesk.tsx';
import { 
  AdminConsole 
} from './components/admin/AdminConsole.tsx';
import { 
  BackendStatusModal 
} from './components/backend/BackendStatusModal.tsx';
import { 
  NotificationsDrawer 
} from './components/notifications/NotificationsDrawer.tsx';

import { 
  User, 
  Building, 
  LeakReport, 
  NotificationItem, 
  AuditLog, 
  UserRole 
} from './types/index.ts';
import { apiClient } from './services/api.ts';
import { SEED_USERS, SEED_BUILDINGS, SEED_LEAK_REPORTS, SEED_NOTIFICATIONS, SEED_AUDIT_LOGS } from './services/seedData.ts';

export default function App() {
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [currentUser, setCurrentUser] = useState<User>(SEED_USERS[0]); // default resident
  const [buildings, setBuildings] = useState<Building[]>(SEED_BUILDINGS);
  const [reports, setReports] = useState<LeakReport[]>(SEED_LEAK_REPORTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(SEED_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(SEED_AUDIT_LOGS);

  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedReport, setSelectedReport] = useState<LeakReport | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  // Load live data from Express REST API
  const refreshData = async () => {
    try {
      const [bData, rData, nData, aData] = await Promise.all([
        apiClient.getBuildings(),
        apiClient.getLeaks(),
        apiClient.getNotifications(),
        apiClient.getAuditLogs()
      ]);
      if (bData) setBuildings(bData);
      if (rData) setReports(rData);
      if (nData) setNotifications(nData);
      if (aData) setAuditLogs(aData);
    } catch (err) {
      console.warn('Backend API connection notice, using synchronized local store.', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Role switch handler
  const handleRoleSwitch = (role: UserRole) => {
    const targetUser = users.find(u => u.role === role) || users[0];
    setCurrentUser(targetUser);
    // If switching to resident, ensure appropriate view
    if (role === 'resident' && (activeView === 'admin' || activeView === 'maintenance')) {
      setActiveView('dashboard');
    }
  };

  // Submit new report
  const handleSubmitReport = async (data: any) => {
    const res = await apiClient.createLeak(data);
    if (res && res.report) {
      setReports(prev => [res.report, ...prev]);
      refreshData();
    }
    return res;
  };

  // Assign technician
  const handleAssignTechnician = async (reportId: string, technicianId: string) => {
    const updated = await apiClient.assignTechnician(reportId, technicianId, currentUser.name);
    if (updated) {
      setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
      setSelectedReport(updated);
      refreshData();
    }
  };

  // Update progress & evidence closure
  const handleUpdateProgress = async (reportId: string, payload: any) => {
    const updated = await apiClient.updateProgress(reportId, payload);
    if (updated) {
      setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
      setSelectedReport(updated);
      refreshData();
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    await apiClient.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const activeLeaksCount = reports.filter(r => r.status !== 'resolved' && r.status !== 'closed').length;
  const criticalCount = reports.filter(r => r.severity === 'critical' && r.status !== 'resolved').length;
  const technicians = users.filter(u => u.role === 'maintenance');

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans">
      {/* Dark Navy Sidebar */}
      <Sidebar
        currentRole={currentUser.role}
        activeView={activeView}
        onSelectView={setActiveView}
        activeLeaksCount={activeLeaksCount}
        criticalCount={criticalCount}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar Contract Header */}
        <Navbar
          currentUser={currentUser}
          onRoleSwitch={handleRoleSwitch}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          onOpenBackendModal={() => setIsBackendModalOpen(true)}
          notifications={notifications}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          activeView={activeView}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {activeView === 'dashboard' && (
            <OverviewDashboard
              reports={reports}
              buildings={buildings}
              onOpenReport={setSelectedReport}
              onOpenNewReportModal={() => setIsReportModalOpen(true)}
              onNavigateToHotspots={() => setActiveView('hotspots')}
              onNavigateToIncidents={() => setActiveView('incidents')}
            />
          )}

          {activeView === 'incidents' && (
            <IncidentTable
              reports={reports}
              buildings={buildings}
              currentRole={currentUser.role}
              onOpenReport={setSelectedReport}
              onOpenNewReport={() => setIsReportModalOpen(true)}
            />
          )}

          {activeView === 'hotspots' && (
            <HotspotMapView
              buildings={buildings}
              reports={reports}
              onOpenReport={setSelectedReport}
            />
          )}

          {activeView === 'analytics' && (
            <AnalyticsView
              reports={reports}
              buildings={buildings}
            />
          )}

          {activeView === 'maintenance' && (
            <MaintenanceDesk
              reports={reports}
              currentUser={currentUser}
              onOpenReport={setSelectedReport}
              onUpdateProgress={handleUpdateProgress}
            />
          )}

          {activeView === 'buildings' && (
            <HotspotMapView
              buildings={buildings}
              reports={reports}
              onOpenReport={setSelectedReport}
            />
          )}

          {activeView === 'admin' && (
            <AdminConsole
              users={users}
              buildings={buildings}
              reports={reports}
              auditLogs={auditLogs}
            />
          )}

          {activeView === 'backend' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
                <h2 className="text-base font-bold text-slate-900 mb-2">
                  LeakLens MERN Stack Backend & Database Specification
                </h2>
                <p className="text-xs text-slate-600 mb-4">
                  Full Express.js REST API is active with comprehensive Mongoose data models, field validation, and compound indexes.
                </p>
                <button
                  onClick={() => setIsBackendModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-md transition-colors shadow-xs"
                >
                  Launch Full Architecture & Mongoose Models Inspector
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals & Overlays */}
      <ReportLeakModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        buildings={buildings}
        existingReports={reports}
        currentUser={currentUser}
        onSubmitReport={handleSubmitReport}
      />

      <IncidentDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        currentUser={currentUser}
        onAssignTechnician={handleAssignTechnician}
        onUpdateProgress={handleUpdateProgress}
        technicians={technicians}
      />

      <BackendStatusModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onSelectTicket={(ticketId) => {
          const match = reports.find(r => r.id === ticketId || r.ticketNumber === ticketId);
          if (match) {
            setSelectedReport(match);
            setIsNotificationsOpen(false);
          }
        }}
      />
    </div>
  );
}
