export type UserRole = 'resident' | 'maintenance' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  roomNumber?: string;
  buildingId?: string;
  avatar?: string;
  department?: string;
  specialty?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export type LeakSeverity = 'minor' | 'moderate' | 'severe' | 'critical';

export type LeakStatus = 'reported' | 'assigned' | 'in_progress' | 'resolved' | 'closed';

export type LeakType = 
  | 'faucet' 
  | 'pipe_joint' 
  | 'ceiling_seepage' 
  | 'flush_valve' 
  | 'drain_overflow' 
  | 'geyser_heater' 
  | 'main_riser';

export interface Building {
  id: string;
  name: string;
  code: string;
  type: 'hostel' | 'academic' | 'residential' | 'faculty';
  totalFloors: number;
  totalRooms: number;
  wings: string[];
  openLeaksCount: number;
  totalWastageLiters: number;
  hotspotScore: number; // 0-100
}

export interface LeakReport {
  id: string;
  ticketNumber: string; // e.g. LK-2026-104
  title: string;
  description: string;
  buildingId: string;
  buildingName: string;
  floor: number;
  roomOrZone: string;
  plumbingShaftOrRiser?: string;
  severity: LeakSeverity;
  leakType: LeakType;
  status: LeakStatus;
  
  // Reporter
  reportedBy: {
    userId: string;
    name: string;
    role: UserRole;
    contact?: string;
  };
  
  // Media
  photoUrl: string;
  resolutionPhotoUrl?: string;
  
  // Wastage parameters
  leakRateLph: number; // Liters per hour (assumed or measured)
  isEstimatedRate: boolean;
  waterLossLiters: number; // calculated dynamically based on duration
  costLostINR: number; // water tariff estimation
  
  // Intelligence & Risk
  riskScore: number; // 1 - 100
  isRecurring: boolean;
  recurrenceCount: number; // how many leaks in same riser/room in last 90 days
  isDuplicateFlagged: boolean;
  duplicateOfTicketId?: string;
  
  // Assignment
  assignment?: {
    assignedToId: string;
    technicianName: string;
    assignedAt: string;
    startedAt?: string;
    estimatedCompletionTime?: string;
    notes?: string;
    partsReplaced?: string[];
    waterValveShutOff: boolean;
    hoursSpent?: number;
  };
  
  // Timestamps
  reportedAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  slaBreach: boolean;
}

export interface MaintenanceAssignment {
  id: string;
  leakReportId: string;
  technicianId: string;
  technicianName: string;
  status: 'pending' | 'in_progress' | 'parts_ordered' | 'completed';
  assignedBy: string;
  notes: string;
  resolutionSummary?: string;
  partsUsed: string[];
  evidencePhotoUrl?: string;
  waterValveConfirmedClosed: boolean;
  workHoursLogged: number;
  assignedAt: string;
  completedAt?: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  roleTarget?: UserRole | 'all';
  title: string;
  message: string;
  type: 'urgent' | 'assignment' | 'resolved' | 'sla_breach' | 'duplicate';
  ticketId?: string;
  createdAt: string;
  isRead: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  targetId: string;
  targetType: 'leak_report' | 'assignment' | 'user' | 'building';
  details: string;
  timestamp: string;
}

export interface WaterRateAssumptions {
  minor: number; // e.g. 0.8 L/hr (slow drip)
  moderate: number; // e.g. 15 L/hr (steady drip/trickle)
  severe: number; // e.g. 75 L/hr (running stream)
  critical: number; // e.g. 350 L/hr (pipe burst / main line)
  costPerKiloliterINR: number; // e.g. 45 INR per 1000L
}
