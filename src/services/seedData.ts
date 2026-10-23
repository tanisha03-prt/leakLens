import { Building, User, LeakReport, NotificationItem, AuditLog } from '../types/index.ts';

export const SEED_USERS: User[] = [
  {
    id: 'usr_res_1',
    name: 'Aditi Sharma',
    email: 'aditi.sharma@campus.edu',
    role: 'resident',
    phone: '+91 98765 43210',
    roomNumber: 'Room B-312',
    buildingId: 'bld_nilgiri_b',
    avatar: '/src/assets/images/avatar_resident_user_1792652999623.jpg',
    status: 'active',
    createdAt: '2026-08-15T09:00:00.000Z'
  },
  {
    id: 'usr_res_2',
    name: 'Rohan Verma',
    email: 'rohan.v@campus.edu',
    role: 'resident',
    phone: '+91 98765 88921',
    roomNumber: 'Room A-108',
    buildingId: 'bld_aravali_a',
    status: 'active',
    createdAt: '2026-08-20T11:30:00.000Z'
  },
  {
    id: 'usr_maint_1',
    name: 'Rajesh Kumar',
    email: 'rajesh.plumbing@facility.campus.edu',
    role: 'maintenance',
    phone: '+91 98112 44321',
    department: 'Plumbing & Hydraulic Services',
    specialty: 'High-Pressure Risers & Valves',
    status: 'active',
    createdAt: '2025-05-10T08:00:00.000Z'
  },
  {
    id: 'usr_maint_2',
    name: 'Amit Deshmukh',
    email: 'amit.d@facility.campus.edu',
    role: 'maintenance',
    phone: '+91 98223 77610',
    department: 'Civil Maintenance',
    specialty: 'Fixtures, Basins & Geysers',
    status: 'active',
    createdAt: '2025-07-12T08:30:00.000Z'
  },
  {
    id: 'usr_admin_1',
    name: 'Vikram Malhotra',
    email: 'estate.officer@campus.edu',
    role: 'admin',
    phone: '+91 99000 11223',
    department: 'Campus Infrastructure & Sustainability',
    specialty: 'Chief Estate Operations Officer',
    status: 'active',
    createdAt: '2024-01-01T08:00:00.000Z'
  }
];

export const SEED_BUILDINGS: Building[] = [
  {
    id: 'bld_nilgiri_b',
    name: 'Nilgiri Hostel Block B',
    code: 'NH-B',
    type: 'hostel',
    totalFloors: 5,
    totalRooms: 140,
    wings: ['East Wing', 'West Wing'],
    openLeaksCount: 3,
    totalWastageLiters: 1480,
    hotspotScore: 82
  },
  {
    id: 'bld_aravali_a',
    name: 'Aravali Hostel Block A',
    code: 'AH-A',
    type: 'hostel',
    totalFloors: 4,
    totalRooms: 112,
    wings: ['North Wing', 'South Wing'],
    openLeaksCount: 1,
    totalWastageLiters: 320,
    hotspotScore: 45
  },
  {
    id: 'bld_ramanujan',
    name: 'Ramanujan Science Complex',
    code: 'RSC',
    type: 'academic',
    totalFloors: 6,
    totalRooms: 84,
    wings: ['Core Lab Wing', 'Lecture Hall Block'],
    openLeaksCount: 1,
    totalWastageLiters: 890,
    hotspotScore: 68
  },
  {
    id: 'bld_vindhya',
    name: 'Vindhya Faculty Residency',
    code: 'VFR',
    type: 'faculty',
    totalFloors: 4,
    totalRooms: 48,
    wings: ['Tower 1', 'Tower 2'],
    openLeaksCount: 0,
    totalWastageLiters: 65,
    hotspotScore: 18
  }
];

export const SEED_LEAK_REPORTS: LeakReport[] = [
  {
    id: 'rep_101',
    ticketNumber: 'LK-2026-101',
    title: 'Severe Washbasin Riser Joint Leakage',
    description: 'Continuous heavy water spray beneath the 3rd floor central washbasin bank. Water is pooling on tiles and seeping down through the conduit towards Floor 2.',
    buildingId: 'bld_nilgiri_b',
    buildingName: 'Nilgiri Hostel Block B',
    floor: 3,
    roomOrZone: 'Washroom 302 (West Wing)',
    plumbingShaftOrRiser: 'Shaft W-3',
    severity: 'severe',
    leakType: 'pipe_joint',
    status: 'in_progress',
    reportedBy: {
      userId: 'usr_res_1',
      name: 'Aditi Sharma',
      role: 'resident',
      contact: '+91 98765 43210'
    },
    photoUrl: '/src/assets/images/leak_pipe_dripping_1792652997799.jpg',
    leakRateLph: 85.0,
    isEstimatedRate: true,
    waterLossLiters: 1190.0,
    costLostINR: 57.12,
    riskScore: 84,
    isRecurring: true,
    recurrenceCount: 3,
    isDuplicateFlagged: false,
    assignment: {
      assignedToId: 'usr_maint_1',
      technicianName: 'Rajesh Kumar',
      assignedAt: '2026-10-21T14:30:00.000Z',
      startedAt: '2026-10-21T15:00:00.000Z',
      notes: 'Isolated main stopcock for West Wing riser. Procured high-grade CPVC 1-inch union adapter.',
      partsReplaced: ['1-inch CPVC Coupling', 'Teflon Sealing Tape', 'Rubber O-Ring'],
      waterValveShutOff: true,
      hoursSpent: 2.5
    },
    reportedAt: '2026-10-21T10:00:00.000Z',
    updatedAt: '2026-10-21T16:00:00.000Z',
    slaBreach: true
  },
  {
    id: 'rep_102',
    ticketNumber: 'LK-2026-102',
    title: 'Flush Cistern Continuous Valve Overflow',
    description: 'Internal ballcock valve stuck open in cubicle 4. Tank continuously running into drain 24/7.',
    buildingId: 'bld_nilgiri_b',
    buildingName: 'Nilgiri Hostel Block B',
    floor: 2,
    roomOrZone: 'Washroom 204 (East Wing)',
    plumbingShaftOrRiser: 'Shaft E-2',
    severity: 'moderate',
    leakType: 'flush_valve',
    status: 'assigned',
    reportedBy: {
      userId: 'usr_res_1',
      name: 'Aditi Sharma',
      role: 'resident',
      contact: '+91 98765 43210'
    },
    photoUrl: '/src/assets/images/leak_pipe_dripping_1792652997799.jpg',
    leakRateLph: 18.0,
    isEstimatedRate: true,
    waterLossLiters: 216.0,
    costLostINR: 10.37,
    riskScore: 48,
    isRecurring: false,
    recurrenceCount: 0,
    isDuplicateFlagged: false,
    assignment: {
      assignedToId: 'usr_maint_2',
      technicianName: 'Amit Deshmukh',
      assignedAt: '2026-10-21T18:00:00.000Z',
      notes: 'Assigned for morning inspection.',
      partsReplaced: [],
      waterValveShutOff: false,
      hoursSpent: 0
    },
    reportedAt: '2026-10-21T10:00:00.000Z',
    updatedAt: '2026-10-21T18:00:00.000Z',
    slaBreach: false
  },
  {
    id: 'rep_103',
    ticketNumber: 'LK-2026-103',
    title: 'Main Supply Riser Header Crack',
    description: 'High pressure vertical distribution line cracked at level 4 tee joint. Water gushing against ceiling plenum.',
    buildingId: 'bld_ramanujan',
    buildingName: 'Ramanujan Science Complex',
    floor: 4,
    roomOrZone: 'Chemical Prep Lab Corridor Riser',
    plumbingShaftOrRiser: 'Riser C-4',
    severity: 'critical',
    leakType: 'main_riser',
    status: 'in_progress',
    reportedBy: {
      userId: 'usr_admin_1',
      name: 'Vikram Malhotra',
      role: 'admin',
      contact: '+91 99000 11223'
    },
    photoUrl: '/src/assets/images/leak_pipe_dripping_1792652997799.jpg',
    leakRateLph: 320.0,
    isEstimatedRate: true,
    waterLossLiters: 890.0,
    costLostINR: 42.72,
    riskScore: 98,
    isRecurring: true,
    recurrenceCount: 2,
    isDuplicateFlagged: false,
    assignment: {
      assignedToId: 'usr_maint_1',
      technicianName: 'Rajesh Kumar',
      assignedAt: '2026-10-21T21:15:00.000Z',
      startedAt: '2026-10-21T21:30:00.000Z',
      notes: 'Emergency isolation of Booster Pump #2 completed. Cutting out cracked 2.5 inch section.',
      partsReplaced: ['2.5-inch Galvanized Pipe Segment', 'Mechanical Grooved Coupling'],
      waterValveShutOff: true,
      hoursSpent: 3.5
    },
    reportedAt: '2026-10-21T21:00:00.000Z',
    updatedAt: '2026-10-21T23:00:00.000Z',
    slaBreach: false
  },
  {
    id: 'rep_104',
    ticketNumber: 'LK-2026-104',
    title: 'Bathroom 108 Washbasin Faucet Cartridge Leak',
    description: 'Tap does not turn off completely; drips steadily 24 hours a day even when shut tightly.',
    buildingId: 'bld_aravali_a',
    buildingName: 'Aravali Hostel Block A',
    floor: 1,
    roomOrZone: 'Room A-108 Washroom',
    plumbingShaftOrRiser: 'Shaft A1',
    severity: 'minor',
    leakType: 'faucet',
    status: 'reported',
    reportedBy: {
      userId: 'usr_res_2',
      name: 'Rohan Verma',
      role: 'resident',
      contact: '+91 98765 88921'
    },
    photoUrl: '/src/assets/images/leak_pipe_dripping_1792652997799.jpg',
    leakRateLph: 0.8,
    isEstimatedRate: true,
    waterLossLiters: 19.2,
    costLostINR: 0.92,
    riskScore: 24,
    isRecurring: false,
    recurrenceCount: 0,
    isDuplicateFlagged: false,
    reportedAt: '2026-10-21T01:00:00.000Z',
    updatedAt: '2026-10-21T01:00:00.000Z',
    slaBreach: false
  },
  {
    id: 'rep_100',
    ticketNumber: 'LK-2026-100',
    title: 'Shower Isolation Valve Joint Failure (Resolved)',
    description: 'Brass valve threaded connector degraded with high velocity spray. Completely repaired and verified dry under full campus pressure.',
    buildingId: 'bld_nilgiri_b',
    buildingName: 'Nilgiri Hostel Block B',
    floor: 1,
    roomOrZone: 'Ground Floor Common Shower B',
    plumbingShaftOrRiser: 'Shaft GF-B',
    severity: 'moderate',
    leakType: 'pipe_joint',
    status: 'resolved',
    reportedBy: {
      userId: 'usr_res_1',
      name: 'Aditi Sharma',
      role: 'resident',
      contact: '+91 98765 43210'
    },
    photoUrl: '/src/assets/images/leak_pipe_dripping_1792652997799.jpg',
    resolutionPhotoUrl: '/src/assets/images/repaired_pipe_clean_1792652998773.jpg',
    leakRateLph: 18.0,
    isEstimatedRate: true,
    waterLossLiters: 74.0,
    costLostINR: 3.55,
    riskScore: 10,
    isRecurring: false,
    recurrenceCount: 0,
    isDuplicateFlagged: false,
    assignment: {
      assignedToId: 'usr_maint_1',
      technicianName: 'Rajesh Kumar',
      assignedAt: '2026-10-20T08:00:00.000Z',
      startedAt: '2026-10-20T08:30:00.000Z',
      notes: 'Fitted new brass ball valve with dual silicone gaskets. Tested to 4.2 bar static pressure without any moisture.',
      partsReplaced: ['1/2 inch KITZ Brass Ball Valve', 'High-Density PTFE Tape', 'Brass Hex Nipple'],
      waterValveShutOff: true,
      hoursSpent: 1.8
    },
    reportedAt: '2026-10-20T07:00:00.000Z',
    updatedAt: '2026-10-20T11:15:00.000Z',
    resolvedAt: '2026-10-20T11:15:00.000Z',
    slaBreach: false
  }
];

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    roleTarget: 'all',
    title: 'Critical Incident Escalation (SLA Warning)',
    message: 'LK-2026-101 (Nilgiri Block B Washroom 302) has been in progress over 24 hours. Water loss exceeds 1,100 Litres.',
    type: 'sla_breach',
    ticketId: 'rep_101',
    createdAt: '2026-10-21T22:00:00.000Z',
    isRead: false
  },
  {
    id: 'notif_2',
    roleTarget: 'maintenance',
    title: 'New Emergency Assignment',
    message: 'Rajesh Kumar assigned to LK-2026-103: Main Supply Riser Header Crack in Ramanujan Complex.',
    type: 'assignment',
    ticketId: 'rep_103',
    createdAt: '2026-10-21T21:15:00.000Z',
    isRead: false
  },
  {
    id: 'notif_3',
    roleTarget: 'resident',
    title: 'Repair Verification Complete',
    message: 'Your report LK-2026-100 (Ground Floor Shower) has been marked Resolved with photographic evidence.',
    type: 'resolved',
    ticketId: 'rep_100',
    createdAt: '2026-10-20T11:15:00.000Z',
    isRead: true
  }
];

export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud_1',
    action: 'LEAK_REPORTED',
    actorId: 'usr_res_1',
    actorName: 'Aditi Sharma',
    actorRole: 'resident',
    targetId: 'rep_101',
    targetType: 'leak_report',
    details: 'Submitted leak report LK-2026-101 with photographic proof for Nilgiri B Floor 3.',
    timestamp: '2026-10-21T10:00:00.000Z'
  },
  {
    id: 'aud_2',
    action: 'TECHNICIAN_ASSIGNED',
    actorId: 'usr_admin_1',
    actorName: 'Vikram Malhotra',
    actorRole: 'admin',
    targetId: 'rep_101',
    targetType: 'assignment',
    details: 'Assigned Senior Plumber Rajesh Kumar to LK-2026-101.',
    timestamp: '2026-10-21T14:30:00.000Z'
  },
  {
    id: 'aud_3',
    action: 'WORK_PROGRESS_UPDATED',
    actorId: 'usr_maint_1',
    actorName: 'Rajesh Kumar',
    actorRole: 'maintenance',
    targetId: 'rep_101',
    targetType: 'leak_report',
    details: 'Status changed to IN_PROGRESS. Main stopcock isolated for West Wing riser.',
    timestamp: '2026-10-21T15:00:00.000Z'
  },
  {
    id: 'aud_4',
    action: 'REPAIR_RESOLVED_EVIDENCE',
    actorId: 'usr_maint_1',
    actorName: 'Rajesh Kumar',
    actorRole: 'maintenance',
    targetId: 'rep_100',
    targetType: 'leak_report',
    details: 'Uploaded resolution evidence photograph and replaced brass ball valve with silicone seal.',
    timestamp: '2026-10-20T11:15:00.000Z'
  }
];
