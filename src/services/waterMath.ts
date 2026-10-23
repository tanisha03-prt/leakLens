import { LeakSeverity } from '../types/index.ts';

export const LEAK_RATE_LPH: Record<LeakSeverity, number> = {
  minor: 0.8,     // slow drip (~1 drop every 2-3 sec)
  moderate: 18.0,  // steady drip / small stream
  severe: 85.0,    // continuous running stream / cracked pipe
  critical: 320.0  // pressurized burst / main riser failure
};

// Municipal / campus water tariff rate: ₹48 per 1,000 Liters (1 kiloliter)
export const WATER_COST_PER_LITER_INR = 0.048;

/**
 * Calculates water loss in Liters and estimated cost in INR
 * based on leak severity and duration between report and resolution (or current time).
 */
export function calculateWaterLoss(
  severity: LeakSeverity, 
  reportedAtIso: string, 
  resolvedAtIso?: string
): { 
  liters: number; 
  costINR: number; 
  hoursElapsed: number;
  ratePerHour: number;
  isEstimate: boolean;
} {
  const start = new Date(reportedAtIso).getTime();
  const end = resolvedAtIso ? new Date(resolvedAtIso).getTime() : Date.now();
  const hoursElapsed = Math.max(0.1, (end - start) / (1000 * 60 * 60));
  
  const ratePerHour = LEAK_RATE_LPH[severity] || 0.8;
  const liters = Math.round(hoursElapsed * ratePerHour * 10) / 10;
  const costINR = Math.round(liters * WATER_COST_PER_LITER_INR * 100) / 100;
  
  return {
    liters,
    costINR,
    hoursElapsed: Math.round(hoursElapsed * 10) / 10,
    ratePerHour,
    isEstimate: true
  };
}

/**
 * Calculate dynamic Risk Score (1-100)
 * Factors:
 * 1. Base severity (15 to 90)
 * 2. Unresolved aging penalty (up to +25)
 * 3. Historical recurrence count (up to +25)
 * 4. Critical location factor (main riser or high occupancy)
 */
export function calculateRiskScore(
  severity: LeakSeverity,
  reportedAtIso: string,
  recurrenceCount: number = 0,
  leakType?: string,
  isResolved: boolean = false
): number {
  if (isResolved) return 10;

  let score = 20;
  switch (severity) {
    case 'critical':
      score = 80;
      break;
    case 'severe':
      score = 55;
      break;
    case 'moderate':
      score = 35;
      break;
    case 'minor':
    default:
      score = 15;
      break;
  }

  // Recurrence penalty
  score += Math.min(25, recurrenceCount * 8);

  // Time elapsed penalty
  const hours = (Date.now() - new Date(reportedAtIso).getTime()) / (1000 * 60 * 60);
  if (hours > 72) score += 20;
  else if (hours > 24) score += 12;
  else if (hours > 12) score += 6;

  // Hazardous leak type
  if (leakType === 'main_riser' || leakType === 'ceiling_seepage') {
    score += 8;
  }

  return Math.min(100, Math.max(1, Math.round(score)));
}

/**
 * Duplicate Detection Engine:
 * Compares a draft report with active open reports.
 */
export interface DuplicateMatchResult {
  isDuplicate: boolean;
  matchedTicket?: {
    ticketNumber: string;
    id: string;
    title: string;
    buildingName: string;
    roomOrZone: string;
    reportedAt: string;
    status: string;
  };
  confidence: number;
}

export function detectDuplicateComplaint(
  draft: {
    buildingId: string;
    floor: number;
    roomOrZone: string;
    leakType: string;
  },
  existingReports: Array<{
    id: string;
    ticketNumber: string;
    title: string;
    buildingId: string;
    buildingName: string;
    floor: number;
    roomOrZone: string;
    leakType: string;
    status: string;
    reportedAt: string;
  }>
): DuplicateMatchResult {
  const normalizedZone = draft.roomOrZone.toLowerCase().trim();
  if (!normalizedZone || !draft.buildingId) {
    return { isDuplicate: false, confidence: 0 };
  }

  const openReports = existingReports.filter(r => r.status !== 'closed' && r.status !== 'resolved');

  for (const report of openReports) {
    if (report.buildingId === draft.buildingId && report.floor === draft.floor) {
      const existingZone = report.roomOrZone.toLowerCase().trim();
      
      // Exact or substring match in room/zone
      const isRoomMatch = existingZone.includes(normalizedZone) || normalizedZone.includes(existingZone);
      const isTypeMatch = report.leakType === draft.leakType;

      if (isRoomMatch) {
        const confidence = isTypeMatch ? 95 : 75;
        return {
          isDuplicate: true,
          confidence,
          matchedTicket: {
            id: report.id,
            ticketNumber: report.ticketNumber,
            title: report.title,
            buildingName: report.buildingName,
            roomOrZone: report.roomOrZone,
            reportedAt: report.reportedAt,
            status: report.status
          }
        };
      }
    }
  }

  return { isDuplicate: false, confidence: 0 };
}
