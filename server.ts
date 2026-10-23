import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import {
  User,
  Building,
  LeakReport,
  MaintenanceAssignment,
  Notification,
  AuditLog
} from './src/models/index.ts';
import {
  SEED_USERS,
  SEED_BUILDINGS,
  SEED_LEAK_REPORTS,
  SEED_NOTIFICATIONS,
  SEED_AUDIT_LOGS
} from './src/services/seedData.ts';
import { calculateWaterLoss, calculateRiskScore, detectDuplicateComplaint } from './src/services/waterMath.ts';
import { LeakReport as ILeakReportType, User as IUserType, Building as IBuildingType, NotificationItem, AuditLog as IAuditLogType } from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// In-memory document store matching Mongoose schema collections (fallback & cache)
let memoryUsers: IUserType[] = [...SEED_USERS];
let memoryBuildings: IBuildingType[] = [...SEED_BUILDINGS];
let memoryReports: ILeakReportType[] = [...SEED_LEAK_REPORTS];
let memoryNotifications: NotificationItem[] = [...SEED_NOTIFICATIONS];
let memoryAuditLogs: IAuditLogType[] = [...SEED_AUDIT_LOGS];

// MongoDB status tracking
let isMongoConnected = false;
let mongoErrorMessage = 'No MongoDB instance configured in environment. Using in-memory persistent store.';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/leaklens';

/**
 * Safely format a Mongoose document or plain object into the frontend LeakReport contract
 */
function formatReportDoc(doc: any): ILeakReportType {
  const obj = doc && typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    id: obj.id || (obj._id ? obj._id.toString() : `rep_${Date.now()}`),
    ticketNumber: obj.ticketNumber,
    title: obj.title,
    description: obj.description,
    buildingId: obj.buildingId ? (obj.buildingId.toString ? obj.buildingId.toString() : String(obj.buildingId)) : '',
    buildingName: obj.buildingName,
    floor: Number(obj.floor),
    roomOrZone: obj.roomOrZone,
    plumbingShaftOrRiser: obj.plumbingShaftOrRiser,
    severity: obj.severity,
    leakType: obj.leakType,
    status: obj.status,
    reportedBy: {
      userId: obj.reportedBy?.userId ? (obj.reportedBy.userId.toString ? obj.reportedBy.userId.toString() : String(obj.reportedBy.userId)) : 'usr_res_1',
      name: obj.reportedBy?.name || 'Resident',
      role: obj.reportedBy?.role || 'resident',
      contact: obj.reportedBy?.contact
    },
    photoUrl: obj.photoUrl,
    resolutionPhotoUrl: obj.resolutionPhotoUrl,
    leakRateLph: Number(obj.leakRateLph) || 0.8,
    isEstimatedRate: obj.isEstimatedRate !== undefined ? Boolean(obj.isEstimatedRate) : true,
    waterLossLiters: Number(obj.waterLossLiters) || 0,
    costLostINR: Number(obj.costLostINR) || 0,
    riskScore: Number(obj.riskScore) || 20,
    isRecurring: Boolean(obj.isRecurring),
    recurrenceCount: Number(obj.recurrenceCount) || 0,
    isDuplicateFlagged: Boolean(obj.isDuplicateFlagged),
    duplicateOfTicketId: obj.duplicateOfTicketId,
    assignment: obj.assignment ? {
      assignedToId: obj.assignment.assignedToId ? (obj.assignment.assignedToId.toString ? obj.assignment.assignedToId.toString() : String(obj.assignment.assignedToId)) : '',
      technicianName: obj.assignment.technicianName || '',
      assignedAt: obj.assignment.assignedAt ? new Date(obj.assignment.assignedAt).toISOString() : new Date().toISOString(),
      startedAt: obj.assignment.startedAt ? new Date(obj.assignment.startedAt).toISOString() : undefined,
      estimatedCompletionTime: obj.assignment.estimatedCompletionTime ? new Date(obj.assignment.estimatedCompletionTime).toISOString() : undefined,
      notes: obj.assignment.notes,
      partsReplaced: obj.assignment.partsReplaced || [],
      waterValveShutOff: Boolean(obj.assignment.waterValveShutOff),
      hoursSpent: Number(obj.assignment.hoursSpent) || 0
    } : undefined,
    reportedAt: obj.reportedAt ? new Date(obj.reportedAt).toISOString() : new Date().toISOString(),
    updatedAt: obj.updatedAt ? new Date(obj.updatedAt).toISOString() : new Date().toISOString(),
    resolvedAt: obj.resolvedAt ? new Date(obj.resolvedAt).toISOString() : undefined,
    closedAt: obj.closedAt ? new Date(obj.closedAt).toISOString() : undefined,
    slaBreach: Boolean(obj.slaBreach)
  };
}

/**
 * Seed MongoDB collections on first connection if they are empty
 */
async function seedMongoIfEmpty() {
  try {
    const leakCount = await LeakReport.countDocuments();
    if (leakCount === 0) {
      console.log('🌱 Seeding initial demo leak reports into MongoDB...');
      for (const rep of SEED_LEAK_REPORTS) {
        await LeakReport.create({
          ticketNumber: rep.ticketNumber,
          title: rep.title,
          description: rep.description,
          buildingId: rep.buildingId,
          buildingName: rep.buildingName,
          floor: rep.floor,
          roomOrZone: rep.roomOrZone,
          plumbingShaftOrRiser: rep.plumbingShaftOrRiser,
          severity: rep.severity,
          leakType: rep.leakType,
          status: rep.status,
          reportedBy: rep.reportedBy,
          photoUrl: rep.photoUrl,
          resolutionPhotoUrl: rep.resolutionPhotoUrl,
          leakRateLph: rep.leakRateLph,
          isEstimatedRate: rep.isEstimatedRate,
          waterLossLiters: rep.waterLossLiters,
          costLostINR: rep.costLostINR,
          riskScore: rep.riskScore,
          isRecurring: rep.isRecurring,
          recurrenceCount: rep.recurrenceCount,
          isDuplicateFlagged: rep.isDuplicateFlagged,
          duplicateOfTicketId: rep.duplicateOfTicketId,
          assignment: rep.assignment ? {
            ...rep.assignment,
            assignedAt: rep.assignment.assignedAt ? new Date(rep.assignment.assignedAt) : undefined,
            startedAt: rep.assignment.startedAt ? new Date(rep.assignment.startedAt) : undefined
          } : undefined,
          reportedAt: new Date(rep.reportedAt),
          resolvedAt: rep.resolvedAt ? new Date(rep.resolvedAt) : undefined,
          slaBreach: rep.slaBreach
        });
      }
      console.log(`✅ Seeded ${SEED_LEAK_REPORTS.length} leak reports to MongoDB.`);
    }

    const buildingCount = await Building.countDocuments();
    if (buildingCount === 0) {
      for (const b of SEED_BUILDINGS) {
        await Building.create({
          name: b.name,
          code: b.code,
          type: b.type,
          totalFloors: b.totalFloors,
          totalRooms: b.totalRooms,
          wings: b.wings,
          hotspotScore: b.hotspotScore
        });
      }
      console.log(`✅ Seeded ${SEED_BUILDINGS.length} buildings to MongoDB.`);
    }

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      for (const u of SEED_USERS) {
        await User.create({
          name: u.name,
          email: u.email,
          passwordHash: '$2a$10$LeakLensMockHashPasswordSecureDemo2026',
          role: u.role,
          phone: u.phone,
          roomNumber: u.roomNumber,
          department: u.department,
          specialty: u.specialty,
          status: u.status,
          avatar: u.avatar
        });
      }
      console.log(`✅ Seeded ${SEED_USERS.length} users to MongoDB.`);
    }

    const notifCount = await Notification.countDocuments();
    if (notifCount === 0) {
      for (const n of SEED_NOTIFICATIONS) {
        await Notification.create({
          roleTarget: n.roleTarget || 'all',
          title: n.title,
          message: n.message,
          type: n.type,
          ticketId: n.ticketId,
          isRead: n.isRead,
          createdAt: new Date(n.createdAt)
        });
      }
    }

    const auditCount = await AuditLog.countDocuments();
    if (auditCount === 0) {
      for (const a of SEED_AUDIT_LOGS) {
        await AuditLog.create({
          action: a.action,
          actorId: a.actorId,
          actorName: a.actorName,
          actorRole: a.actorRole,
          targetId: a.targetId,
          targetType: a.targetType,
          details: a.details,
          timestamp: new Date(a.timestamp)
        });
      }
    }
  } catch (seedErr) {
    console.warn('Notice during MongoDB initial seeding:', seedErr);
  }
}

async function initMongo() {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 2500
      });
      isMongoConnected = true;
      mongoErrorMessage = '';
      console.log('✅ Connected to MongoDB via Mongoose successfully.');
      await seedMongoIfEmpty();
    } catch (err: any) {
      isMongoConnected = false;
      mongoErrorMessage = err?.message || 'Failed to connect to MongoDB URI.';
      console.log('ℹ️ Notice: MongoDB not reachable, using verified document store.', mongoErrorMessage);
    }
  } else {
    isMongoConnected = false;
    mongoErrorMessage = 'MONGODB_URI is not set. Operating in verified document store mode.';
  }
}

initMongo();

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// 1. Health & Backend Architecture Inspection
app.get('/api/status', async (_req: Request, res: Response) => {
  let userCount = memoryUsers.length;
  let buildingCount = memoryBuildings.length;
  let leakReportCount = memoryReports.length;
  let notificationCount = memoryNotifications.length;
  let auditLogCount = memoryAuditLogs.length;

  if (isMongoConnected) {
    try {
      [userCount, buildingCount, leakReportCount, notificationCount, auditLogCount] = await Promise.all([
        User.countDocuments(),
        Building.countDocuments(),
        LeakReport.countDocuments(),
        Notification.countDocuments(),
        AuditLog.countDocuments()
      ]);
    } catch (err) {
      console.warn('Error reading counts from MongoDB:', err);
    }
  }

  res.json({
    platform: 'LeakLens — Smart Water Leakage Intelligence Platform',
    status: 'operational',
    serverTime: new Date().toISOString(),
    backend: {
      runtime: 'Node.js Express',
      port: PORT,
      mongooseReady: true,
      mongoConnected: isMongoConnected,
      storageMode: isMongoConnected ? 'Persistent MongoDB (Mongoose Models)' : 'In-memory fallback document store',
      mongoUri: process.env.MONGODB_URI ? 'Configured in .env' : 'Not configured (using memory store fallback)',
      mongoMessage: mongoErrorMessage,
      models: ['User', 'Building', 'LeakReport', 'MaintenanceAssignment', 'Notification', 'AuditLog']
    },
    counts: {
      users: userCount,
      buildings: buildingCount,
      leakReports: leakReportCount,
      notifications: notificationCount,
      auditLogs: auditLogCount
    }
  });
});

// 2. Authentication Endpoint
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, role } = req.body;
  let user: any = null;

  if (isMongoConnected && email) {
    user = await User.findOne({ email: email.toLowerCase() }).lean().catch(() => null);
  }
  if (!user) {
    user = memoryUsers.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  }
  if (!user && role) {
    if (isMongoConnected) {
      user = await User.findOne({ role }).lean().catch(() => null);
    }
    if (!user) {
      user = memoryUsers.find(u => u.role === role);
    }
  }
  if (!user) {
    user = memoryUsers[0]; // default to first resident
  }
  
  res.json({
    token: `jwt_simulated_${user.id || user._id}_${Date.now()}`,
    user: {
      id: user.id || user._id?.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      roomNumber: user.roomNumber,
      department: user.department,
      specialty: user.specialty,
      status: user.status,
      avatar: user.avatar
    }
  });
});

// 3. Users Management
app.get('/api/users', async (req: Request, res: Response) => {
  const { role } = req.query;
  try {
    if (isMongoConnected) {
      const query: any = {};
      if (role) query.role = role;
      const docs = await User.find(query).lean();
      if (docs && docs.length > 0) {
        return res.json(docs.map((d: any) => ({
          id: d.id || d._id?.toString(),
          name: d.name,
          email: d.email,
          role: d.role,
          phone: d.phone,
          roomNumber: d.roomNumber,
          department: d.department,
          specialty: d.specialty,
          status: d.status,
          avatar: d.avatar,
          createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString()
        })));
      }
    }
  } catch (err) {
    console.warn('Falling back to memory users:', err);
  }

  let list = memoryUsers;
  if (role) {
    list = list.filter(u => u.role === role);
  }
  res.json(list);
});

// 4. Buildings & Campus Hotspots
app.get('/api/buildings', async (_req: Request, res: Response) => {
  try {
    let baseBuildings = memoryBuildings;
    let allLeaks: ILeakReportType[] = [];

    if (isMongoConnected) {
      const bDocs = await Building.find().lean().catch(() => []);
      if (bDocs && bDocs.length > 0) {
        baseBuildings = bDocs.map((b: any) => ({
          id: b.id || b._id?.toString(),
          name: b.name,
          code: b.code,
          type: b.type,
          totalFloors: b.totalFloors,
          totalRooms: b.totalRooms,
          wings: b.wings || [],
          openLeaksCount: 0,
          totalWastageLiters: 0,
          hotspotScore: b.hotspotScore || 0
        }));
      }

      const lDocs = await LeakReport.find().lean().catch(() => []);
      allLeaks = lDocs.map(formatReportDoc);
    } else {
      allLeaks = memoryReports;
    }

    const updatedBuildings = baseBuildings.map(b => {
      const bLeaks = allLeaks.filter(r => r.buildingId === b.id || r.buildingId === b.code);
      const openCount = bLeaks.filter(r => r.status !== 'closed' && r.status !== 'resolved').length;
      const totalWater = bLeaks.reduce((acc, curr) => acc + (curr.waterLossLiters || 0), 0);
      const criticals = bLeaks.filter(r => r.severity === 'critical' && r.status !== 'resolved').length;
      const hotspotScore = Math.min(100, (openCount * 18) + (criticals * 35));
      return {
        ...b,
        openLeaksCount: openCount,
        totalWastageLiters: Math.round(totalWater),
        hotspotScore: hotspotScore || b.hotspotScore
      };
    });

    return res.json(updatedBuildings);
  } catch (err: any) {
    console.error('Error fetching buildings:', err);
    return res.json(memoryBuildings);
  }
});

// 5. Leak Reports - List & Filter (Persistent with MongoDB)
app.get('/api/leaks', async (req: Request, res: Response) => {
  try {
    const { status, severity, buildingId, search, role, userId } = req.query;

    let reports: ILeakReportType[] = [];

    if (isMongoConnected) {
      const filterQuery: any = {};
      if (status && status !== 'all') {
        filterQuery.status = status;
      }
      if (severity && severity !== 'all') {
        filterQuery.severity = severity;
      }
      if (buildingId && buildingId !== 'all') {
        if (mongoose.isValidObjectId(buildingId)) {
          filterQuery.$or = [
            { buildingId: buildingId },
            { buildingId: new mongoose.Types.ObjectId(String(buildingId)) }
          ];
        } else {
          filterQuery.buildingId = buildingId;
        }
      }

      if (search) {
        const query = String(search).trim();
        const searchRegex = new RegExp(query, 'i');
        filterQuery.$or = [
          { ticketNumber: searchRegex },
          { title: searchRegex },
          { roomOrZone: searchRegex },
          { buildingName: searchRegex }
        ];
      }

      if (role === 'resident' && userId) {
        filterQuery['reportedBy.userId'] = userId;
      } else if (role === 'maintenance' && userId) {
        filterQuery.$or = [
          { 'assignment.assignedToId': userId },
          { assignment: { $exists: false } },
          { 'assignment.assignedToId': { $exists: false } }
        ];
      }

      const docs = await LeakReport.find(filterQuery).sort({ reportedAt: -1 });
      reports = docs.map(formatReportDoc);
    } else {
      // In-memory fallback
      reports = [...memoryReports];

      if (role === 'resident' && userId) {
        reports = reports.filter(r => r.reportedBy.userId === userId);
      } else if (role === 'maintenance' && userId) {
        reports = reports.filter(r => !r.assignment || r.assignment.assignedToId === userId);
      }

      if (status && status !== 'all') {
        reports = reports.filter(r => r.status === status);
      }
      if (severity && severity !== 'all') {
        reports = reports.filter(r => r.severity === severity);
      }
      if (buildingId && buildingId !== 'all') {
        reports = reports.filter(r => r.buildingId === buildingId);
      }
      if (search) {
        const query = String(search).toLowerCase();
        reports = reports.filter(r => 
          r.ticketNumber.toLowerCase().includes(query) ||
          r.title.toLowerCase().includes(query) ||
          r.roomOrZone.toLowerCase().includes(query) ||
          r.buildingName.toLowerCase().includes(query)
        );
      }
    }

    // Recalculate dynamic water loss and risk scores
    const computedReports = reports.map(r => {
      const calc = calculateWaterLoss(r.severity, r.reportedAt, r.resolvedAt);
      const score = calculateRiskScore(
        r.severity,
        r.reportedAt,
        r.recurrenceCount || 0,
        r.leakType,
        r.status === 'resolved' || r.status === 'closed'
      );
      return {
        ...r,
        waterLossLiters: calc.liters,
        costLostINR: calc.costINR,
        riskScore: score
      };
    });

    computedReports.sort((a, b) => b.riskScore - a.riskScore);
    return res.json(computedReports);
  } catch (err: any) {
    console.error('Error fetching leaks from MongoDB:', err);
    return res.status(500).json({ error: 'Failed to retrieve leak reports', details: err?.message });
  }
});

// 6. Submit New Leak Report (Persistent with MongoDB)
app.post('/api/leaks', async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      buildingId,
      floor,
      roomOrZone,
      severity,
      leakType,
      photoUrl,
      userId,
      userName,
      userRole
    } = req.body;

    // Strict input validation
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Incident summary / title is required.' });
    }
    if (!buildingId) {
      return res.status(400).json({ error: 'Campus building selection is required.' });
    }
    if (floor === undefined || isNaN(Number(floor))) {
      return res.status(400).json({ error: 'Valid floor number is required.' });
    }
    if (!roomOrZone || typeof roomOrZone !== 'string' || !roomOrZone.trim()) {
      return res.status(400).json({ error: 'Exact room or zone location is required.' });
    }
    if (!severity || !['minor', 'moderate', 'severe', 'critical'].includes(severity)) {
      return res.status(400).json({ error: 'Valid severity level is required (minor, moderate, severe, critical).' });
    }
    if (!leakType) {
      return res.status(400).json({ error: 'Component / plumbing leak type is required.' });
    }

    // Resolve building name safely without assuming it exists or blindly converting to ObjectId
    let buildingName = 'Campus Building';
    let buildingCode = 'B';
    if (isMongoConnected) {
      let bDoc: any = null;
      if (mongoose.isValidObjectId(buildingId)) {
        bDoc = await Building.findById(buildingId).lean().catch(() => null);
      }
      if (!bDoc) {
        bDoc = await Building.findOne({
          $or: [{ code: buildingId }, { name: buildingId }, { _id: buildingId }]
        }).lean().catch(() => null);
      }
      if (bDoc) {
        buildingName = bDoc.name;
        buildingCode = bDoc.code || 'B';
      }
    }
    if (buildingName === 'Campus Building') {
      const memBld = memoryBuildings.find(b => b.id === buildingId || b.code === buildingId);
      if (memBld) {
        buildingName = memBld.name;
        buildingCode = memBld.code;
      }
    }

    // Fetch existing open reports for duplicate check
    let existingOpenReports: ILeakReportType[] = [];
    let totalReportsCount = memoryReports.length;

    if (isMongoConnected) {
      const openDocs = await LeakReport.find({
        status: { $nin: ['resolved', 'closed'] }
      }).lean().catch(() => []);
      existingOpenReports = openDocs.map(formatReportDoc);
      totalReportsCount = await LeakReport.countDocuments().catch(() => memoryReports.length);
    } else {
      existingOpenReports = memoryReports.filter(r => r.status !== 'resolved' && r.status !== 'closed');
    }

    // Run duplicate check
    const dupResult = detectDuplicateComplaint(
      { buildingId: String(buildingId), floor: Number(floor), roomOrZone: String(roomOrZone), leakType: String(leakType) },
      existingOpenReports
    );

    // Recurrence check
    let recurrenceCount = 0;
    if (isMongoConnected) {
      const regex = new RegExp(String(roomOrZone).trim(), 'i');
      const recDocs = await LeakReport.find({
        floor: Number(floor),
        roomOrZone: regex
      }).lean().catch(() => []);
      recurrenceCount = recDocs.length;
    } else {
      recurrenceCount = memoryReports.filter(
        r => String(r.buildingId) === String(buildingId) &&
             r.floor === Number(floor) &&
             r.roomOrZone.toLowerCase().includes(String(roomOrZone).toLowerCase().trim())
      ).length;
    }
    const isRecurring = recurrenceCount > 0;

    const now = new Date();
    const nowIso = now.toISOString();
    const ticketNumber = `LK-2026-${105 + totalReportsCount}`;

    const calc = calculateWaterLoss(severity, nowIso);
    const riskScore = calculateRiskScore(severity, nowIso, recurrenceCount, leakType);

    // Safe reporter identity resolution without blindly casting to ObjectId
    let safeReporterId: any = userId || 'usr_res_1';
    let reporterName = userName || 'Resident User';
    let reporterRole = userRole || 'resident';
    let reporterContact = req.body.contact || '+91 98765 43210';

    if (isMongoConnected && userId) {
      let uDoc: any = null;
      if (mongoose.isValidObjectId(userId)) {
        uDoc = await User.findById(userId).lean().catch(() => null);
      }
      if (!uDoc) {
        uDoc = await User.findOne({ $or: [{ email: userId }, { _id: userId }] }).lean().catch(() => null);
      }
      if (uDoc) {
        safeReporterId = uDoc._id;
        reporterName = uDoc.name;
        reporterRole = uDoc.role;
        if (uDoc.phone) reporterContact = uDoc.phone;
      }
    }

    const reportData = {
      ticketNumber,
      title: title.trim(),
      description: description.trim(),
      buildingId: buildingId,
      buildingName,
      floor: Number(floor),
      roomOrZone: roomOrZone.trim(),
      plumbingShaftOrRiser: `Shaft ${buildingCode}-${floor}`,
      severity,
      leakType,
      status: 'reported' as const,
      reportedBy: {
        userId: safeReporterId,
        name: reporterName,
        role: reporterRole,
        contact: reporterContact
      },
      photoUrl: photoUrl || '/src/assets/images/leak_pipe_dripping_1792652997799.jpg',
      leakRateLph: calc.ratePerHour,
      isEstimatedRate: true,
      waterLossLiters: 0,
      costLostINR: 0,
      riskScore,
      isRecurring,
      recurrenceCount,
      isDuplicateFlagged: dupResult.isDuplicate,
      duplicateOfTicketId: dupResult.matchedTicket?.ticketNumber,
      reportedAt: now,
      slaBreach: false
    };

    let savedReport: ILeakReportType;

    if (isMongoConnected) {
      const createdDoc = await LeakReport.create(reportData);
      savedReport = formatReportDoc(createdDoc);
      // Synchronize in-memory cache
      memoryReports.unshift(savedReport);
      console.log(`✅ Persisted new leak report [${savedReport.ticketNumber}] to MongoDB.`);
    } else {
      savedReport = {
        id: `rep_${Date.now()}`,
        ...reportData,
        reportedAt: nowIso,
        updatedAt: nowIso
      };
      memoryReports.unshift(savedReport);
    }

    // Persist audit log & notification to MongoDB
    if (isMongoConnected) {
      try {
        await AuditLog.create({
          action: 'LEAK_REPORTED',
          actorId: safeReporterId,
          actorName: reporterName,
          actorRole: (reporterRole as any) || 'resident',
          targetId: savedReport.id,
          targetType: 'leak_report',
          details: `Filed report ${ticketNumber} (${severity}) at ${buildingName} - ${roomOrZone}.`,
          timestamp: now
        });
        await Notification.create({
          roleTarget: 'maintenance',
          title: `New ${severity.toUpperCase()} Leak Reported`,
          message: `${ticketNumber} reported in ${buildingName} Floor ${floor} (${roomOrZone}). Initial risk score: ${riskScore}.`,
          type: severity === 'critical' ? 'urgent' : 'assignment',
          ticketId: savedReport.id,
          isRead: false,
          createdAt: now
        });
      } catch (logErr) {
        console.warn('Notice saving audit log to MongoDB:', logErr);
      }
    }

    memoryAuditLogs.unshift({
      id: `aud_${Date.now()}`,
      action: 'LEAK_REPORTED',
      actorId: String(safeReporterId),
      actorName: reporterName,
      actorRole: reporterRole as any,
      targetId: savedReport.id,
      targetType: 'leak_report',
      details: `Filed report ${ticketNumber} (${severity}) at ${buildingName} - ${roomOrZone}.`,
      timestamp: nowIso
    });

    memoryNotifications.unshift({
      id: `notif_${Date.now()}`,
      roleTarget: 'maintenance',
      title: `New ${severity.toUpperCase()} Leak Reported`,
      message: `${ticketNumber} reported in ${buildingName} Floor ${floor} (${roomOrZone}). Initial risk score: ${riskScore}.`,
      type: severity === 'critical' ? 'urgent' : 'assignment',
      ticketId: savedReport.id,
      createdAt: nowIso,
      isRead: false
    });

    return res.status(201).json({
      report: savedReport,
      duplicateAlert: dupResult.isDuplicate ? dupResult : null
    });
  } catch (err: any) {
    console.error('Error creating leak report in MongoDB:', err);
    return res.status(500).json({
      error: 'Failed to create leak report in MongoDB',
      details: err?.message || 'Database error'
    });
  }
});

// 7. Assign Technician (Persistent with MongoDB)
app.post('/api/leaks/:id/assign', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { technicianId, assignedByName } = req.body;

    let reportDoc: any = null;
    let report: ILeakReportType | null = null;

    if (isMongoConnected) {
      if (mongoose.isValidObjectId(id)) {
        reportDoc = await LeakReport.findById(id);
      }
      if (!reportDoc) {
        reportDoc = await LeakReport.findOne({ $or: [{ ticketNumber: id }, { _id: id }] }).catch(() => null);
      }
    }

    if (!reportDoc) {
      report = memoryReports.find(r => r.id === id || r.ticketNumber === id) || null;
      if (!report) return res.status(404).json({ error: 'Incident not found' });
    }

    let techName = 'Assigned Technician';
    if (isMongoConnected && technicianId) {
      let tDoc: any = null;
      if (mongoose.isValidObjectId(technicianId)) {
        tDoc = await User.findById(technicianId).lean().catch(() => null);
      }
      if (!tDoc) {
        tDoc = await User.findOne({ $or: [{ email: technicianId }, { _id: technicianId }] }).lean().catch(() => null);
      }
      if (tDoc) techName = tDoc.name;
    }
    if (techName === 'Assigned Technician') {
      const memTech = memoryUsers.find(u => u.id === technicianId);
      if (memTech) techName = memTech.name;
    }

    const now = new Date();
    const nowIso = now.toISOString();

    if (reportDoc) {
      reportDoc.status = 'assigned';
      reportDoc.assignment = {
        assignedToId: technicianId,
        technicianName: techName,
        assignedAt: now,
        notes: 'Technician dispatched for site inspection.',
        partsReplaced: [],
        waterValveShutOff: false,
        hoursSpent: 0
      };
      reportDoc.updatedAt = now;
      await reportDoc.save();
      report = formatReportDoc(reportDoc);

      const memIdx = memoryReports.findIndex(r => r.id === report!.id || r.ticketNumber === report!.ticketNumber);
      if (memIdx >= 0) memoryReports[memIdx] = report;
      else memoryReports.unshift(report);

      await AuditLog.create({
        action: 'TECHNICIAN_ASSIGNED',
        actorId: 'usr_admin_1',
        actorName: assignedByName || 'Estate Officer',
        actorRole: 'admin',
        targetId: report.id,
        targetType: 'assignment',
        details: `Assigned incident ${report.ticketNumber} to ${techName}.`,
        timestamp: now
      }).catch(() => null);

      await Notification.create({
        userId: technicianId,
        roleTarget: 'maintenance',
        title: 'Incident Assignment Dispatched',
        message: `You were assigned to ${report.ticketNumber} at ${report.buildingName} ${report.roomOrZone}.`,
        type: 'assignment',
        ticketId: report.id,
        createdAt: now,
        isRead: false
      }).catch(() => null);
    } else if (report) {
      report.status = 'assigned';
      report.assignment = {
        assignedToId: technicianId,
        technicianName: techName,
        assignedAt: nowIso,
        notes: 'Technician dispatched for site inspection.',
        partsReplaced: [],
        waterValveShutOff: false,
        hoursSpent: 0
      };
      report.updatedAt = nowIso;
    }

    memoryAuditLogs.unshift({
      id: `aud_${Date.now()}`,
      action: 'TECHNICIAN_ASSIGNED',
      actorId: 'usr_admin_1',
      actorName: assignedByName || 'Estate Officer',
      actorRole: 'admin',
      targetId: report!.id,
      targetType: 'assignment',
      details: `Assigned incident ${report!.ticketNumber} to ${techName}.`,
      timestamp: nowIso
    });

    memoryNotifications.unshift({
      id: `notif_${Date.now()}`,
      userId: technicianId,
      roleTarget: 'maintenance',
      title: 'Incident Assignment Dispatched',
      message: `You were assigned to ${report!.ticketNumber} at ${report!.buildingName} ${report!.roomOrZone}.`,
      type: 'assignment',
      ticketId: report!.id,
      createdAt: nowIso,
      isRead: false
    });

    return res.json(report);
  } catch (err: any) {
    console.error('Error assigning technician:', err);
    return res.status(500).json({ error: 'Failed to assign technician', details: err?.message });
  }
});

// 8. Update Repair Progress & Evidence Closure (Persistent with MongoDB)
app.post('/api/leaks/:id/progress', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes, partsUsed, waterValveShutOff, hoursSpent, evidencePhotoUrl, actorName, actorRole } = req.body;

    let reportDoc: any = null;
    let report: ILeakReportType | null = null;

    if (isMongoConnected) {
      if (mongoose.isValidObjectId(id)) {
        reportDoc = await LeakReport.findById(id);
      }
      if (!reportDoc) {
        reportDoc = await LeakReport.findOne({ $or: [{ ticketNumber: id }, { _id: id }] }).catch(() => null);
      }
    }

    if (!reportDoc) {
      report = memoryReports.find(r => r.id === id || r.ticketNumber === id) || null;
      if (!report) return res.status(404).json({ error: 'Incident not found' });
    }

    const now = new Date();
    const nowIso = now.toISOString();

    if (reportDoc) {
      if (status) reportDoc.status = status;
      if (!reportDoc.assignment) {
        reportDoc.assignment = {
          assignedToId: 'usr_maint_1',
          technicianName: actorName || 'Technician',
          assignedAt: now,
          waterValveShutOff: Boolean(waterValveShutOff),
          hoursSpent: Number(hoursSpent) || 0
        };
      }
      if (notes) reportDoc.assignment.notes = notes;
      if (partsUsed && Array.isArray(partsUsed)) reportDoc.assignment.partsReplaced = partsUsed;
      if (typeof waterValveShutOff === 'boolean') reportDoc.assignment.waterValveShutOff = waterValveShutOff;
      if (hoursSpent !== undefined) reportDoc.assignment.hoursSpent = Number(hoursSpent);

      if (status === 'resolved') {
        reportDoc.resolvedAt = now;
        reportDoc.resolutionPhotoUrl = evidencePhotoUrl || '/src/assets/images/repaired_pipe_clean_1792652998773.jpg';
        reportDoc.riskScore = 10;
      }
      reportDoc.updatedAt = now;
      await reportDoc.save();
      report = formatReportDoc(reportDoc);

      const memIdx = memoryReports.findIndex(r => r.id === report!.id || r.ticketNumber === report!.ticketNumber);
      if (memIdx >= 0) memoryReports[memIdx] = report;
      else memoryReports.unshift(report);

      await AuditLog.create({
        action: status === 'resolved' ? 'REPAIR_RESOLVED_EVIDENCE' : 'WORK_PROGRESS_UPDATED',
        actorId: 'usr_maint_1',
        actorName: actorName || 'Technician',
        actorRole: (actorRole as any) || 'maintenance',
        targetId: report.id,
        targetType: 'leak_report',
        details: status === 'resolved' 
          ? `Completed repair with resolution photo evidence. Parts: ${(partsUsed || []).join(', ') || 'Standard seal'}.`
          : `Updated work status to ${status}. Notes: ${notes || 'Inspection underway'}`,
        timestamp: now
      }).catch(() => null);

      if (status === 'resolved') {
        await Notification.create({
          userId: report.reportedBy.userId,
          roleTarget: 'resident',
          title: 'Leak Incident Resolved',
          message: `Your complaint ${report.ticketNumber} has been resolved by ${report.assignment?.technicianName || 'Technician'}. Resolution photos are attached for verification.`,
          type: 'resolved',
          ticketId: report.id,
          isRead: false,
          createdAt: now
        }).catch(() => null);
      }
    } else if (report) {
      if (status) report.status = status;
      if (!report.assignment) {
        report.assignment = {
          assignedToId: 'usr_maint_1',
          technicianName: actorName || 'Technician',
          assignedAt: nowIso,
          waterValveShutOff: Boolean(waterValveShutOff),
          hoursSpent: Number(hoursSpent) || 0
        };
      }
      if (notes) report.assignment.notes = notes;
      if (partsUsed && Array.isArray(partsUsed)) report.assignment.partsReplaced = partsUsed;
      if (typeof waterValveShutOff === 'boolean') report.assignment.waterValveShutOff = waterValveShutOff;
      if (hoursSpent !== undefined) report.assignment.hoursSpent = Number(hoursSpent);

      if (status === 'resolved') {
        report.resolvedAt = nowIso;
        report.resolutionPhotoUrl = evidencePhotoUrl || '/src/assets/images/repaired_pipe_clean_1792652998773.jpg';
        report.riskScore = 10;
      }
      report.updatedAt = nowIso;
    }

    memoryAuditLogs.unshift({
      id: `aud_${Date.now()}`,
      action: status === 'resolved' ? 'REPAIR_RESOLVED_EVIDENCE' : 'WORK_PROGRESS_UPDATED',
      actorId: 'usr_maint_1',
      actorName: actorName || 'Technician',
      actorRole: (actorRole as any) || 'maintenance',
      targetId: report!.id,
      targetType: 'leak_report',
      details: status === 'resolved' 
        ? `Completed repair with resolution photo evidence. Parts: ${(partsUsed || []).join(', ') || 'Standard seal'}.`
        : `Updated work status to ${status}. Notes: ${notes || 'Inspection underway'}`,
      timestamp: nowIso
    });

    if (status === 'resolved') {
      memoryNotifications.unshift({
        id: `notif_${Date.now()}`,
        userId: report!.reportedBy.userId,
        roleTarget: 'resident',
        title: 'Leak Incident Resolved',
        message: `Your complaint ${report!.ticketNumber} has been resolved by ${report!.assignment?.technicianName || 'Technician'}. Resolution photos are attached for verification.`,
        type: 'resolved',
        ticketId: report!.id,
        createdAt: nowIso,
        isRead: false
      });
    }

    return res.json(report);
  } catch (err: any) {
    console.error('Error updating repair progress:', err);
    return res.status(500).json({ error: 'Failed to update repair progress', details: err?.message });
  }
});

// 9. Analytics Overview
app.get('/api/analytics', async (_req: Request, res: Response) => {
  try {
    let reports = memoryReports;
    if (isMongoConnected) {
      const docs = await LeakReport.find().lean().catch(() => []);
      if (docs && docs.length > 0) {
        reports = docs.map(formatReportDoc);
      }
    }

    const total = reports.length;
    const resolved = reports.filter(r => r.status === 'resolved' || r.status === 'closed').length;
    const active = total - resolved;
    const critical = reports.filter(r => r.severity === 'critical' && r.status !== 'resolved').length;
    
    const totalWaterLost = reports.reduce((acc, curr) => acc + (curr.waterLossLiters || 0), 0);
    const totalCostINR = reports.reduce((acc, curr) => acc + (curr.costLostINR || 0), 0);

    const typeCounts: Record<string, number> = {};
    reports.forEach(r => {
      typeCounts[r.leakType] = (typeCounts[r.leakType] || 0) + 1;
    });

    const recurrenceHotspots = reports
      .filter(r => r.isRecurring || r.recurrenceCount > 0)
      .map(r => ({
        ticket: r.ticketNumber,
        building: r.buildingName,
        floor: r.floor,
        location: r.roomOrZone,
        recurrence: r.recurrenceCount + 1,
        risk: r.riskScore
      }));

    res.json({
      metrics: {
        totalIncidents: total,
        activeIncidents: active,
        resolvedIncidents: resolved,
        criticalAlerts: critical,
        avgResolutionHours: 4.8,
        totalWaterLostLiters: Math.round(totalWaterLost),
        totalCostINR: Math.round(totalCostINR),
        waterConservedLiters: 18500
      },
      byType: typeCounts,
      hotspots: recurrenceHotspots,
      waterTrend: [
        { day: 'Mon', liters: 420 },
        { day: 'Tue', liters: 580 },
        { day: 'Wed', liters: 310 },
        { day: 'Thu', liters: 940 },
        { day: 'Fri', liters: 1250 },
        { day: 'Sat', liters: 780 },
        { day: 'Sun', liters: 640 }
      ]
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to compute analytics', details: err?.message });
  }
});

// 10. Notifications (Persistent with MongoDB)
app.get('/api/notifications', async (req: Request, res: Response) => {
  const { role } = req.query;
  try {
    if (isMongoConnected) {
      const query: any = {};
      if (role) {
        query.$or = [{ roleTarget: 'all' }, { roleTarget: role }];
      }
      const docs = await Notification.find(query).sort({ createdAt: -1 }).lean();
      if (docs && docs.length > 0) {
        return res.json(docs.map((d: any) => ({
          id: d.id || d._id?.toString(),
          roleTarget: d.roleTarget,
          title: d.title,
          message: d.message,
          type: d.type,
          ticketId: d.ticketId,
          isRead: Boolean(d.isRead),
          createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString()
        })));
      }
    }
  } catch (err) {
    console.warn('Falling back to memory notifications:', err);
  }

  let items = memoryNotifications;
  if (role) {
    items = items.filter(n => n.roleTarget === 'all' || n.roleTarget === role);
  }
  res.json(items);
});

app.patch('/api/notifications/:id/read', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    if (isMongoConnected) {
      if (mongoose.isValidObjectId(id)) {
        await Notification.findByIdAndUpdate(id, { isRead: true });
      } else {
        await Notification.findOneAndUpdate({ $or: [{ _id: id }, { ticketId: id }] }, { isRead: true });
      }
    }
  } catch (err) {
    console.warn('Error marking notification read in MongoDB:', err);
  }

  const item = memoryNotifications.find(n => n.id === id);
  if (item) item.isRead = true;
  res.json({ success: true, item });
});

// 11. Audit Logs (Persistent with MongoDB)
app.get('/api/audit-logs', async (_req: Request, res: Response) => {
  try {
    if (isMongoConnected) {
      const docs = await AuditLog.find().sort({ timestamp: -1 }).limit(100).lean();
      if (docs && docs.length > 0) {
        return res.json(docs.map((d: any) => ({
          id: d.id || d._id?.toString(),
          action: d.action,
          actorId: d.actorId ? (d.actorId.toString ? d.actorId.toString() : String(d.actorId)) : 'usr_1',
          actorName: d.actorName,
          actorRole: d.actorRole,
          targetId: d.targetId,
          targetType: d.targetType,
          details: d.details,
          timestamp: d.timestamp ? new Date(d.timestamp).toISOString() : new Date().toISOString()
        })));
      }
    }
  } catch (err) {
    console.warn('Falling back to memory audit logs:', err);
  }
  res.json(memoryAuditLogs);
});

// -------------------------------------------------------------
// VITE DEV SERVER INTEGRATION
// -------------------------------------------------------------
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';
  const httpServer = http.createServer(app);

  if (isDev) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server: httpServer }
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 LeakLens Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
