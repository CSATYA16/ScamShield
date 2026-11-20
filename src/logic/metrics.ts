import type { AppSettings, DashboardMetrics, ThreatRecord } from '../types/scamshield';

export function isSameUtcDay(isoA: string, now: Date = new Date()): boolean {
  const dateA = new Date(isoA);
  if (Number.isNaN(dateA.getTime())) return false;
  return (
    dateA.getFullYear() === now.getFullYear() &&
    dateA.getMonth() === now.getMonth() &&
    dateA.getDate() === now.getDate()
  );
}

export function calculateDashboardMetrics(
  history: ThreatRecord[],
  reportsCount: number,
  settings: AppSettings,
  inHighRiskZone: boolean,
  now: Date = new Date()
): DashboardMetrics {
  const messagesAnalyzed = history.length;

  const isThreat = (r: ThreatRecord) =>
    !r.userMarkedSafe &&
    (r.analysis.riskLevel === 'CRITICAL' ||
      r.analysis.riskLevel === 'HIGH' ||
      r.analysis.riskLevel === 'SUSPICIOUS');

  const threatsDetectedToday = history.filter(
    (r) => isThreat(r) && isSameUtcDay(r.timestamp, now)
  ).length;

  const threatsBlocked = history.filter(
    (r) => !r.userMarkedSafe && r.protectionAction === 'Simulated Block & Isolation'
  ).length;

  // Deterministic protection score based strictly on real configuration and state
  let score = 45;
  if (settings.protectionEnabled) score += 30;
  if (settings.locationProtectionEnabled) score += 10;
  if (settings.voiceAlertsEnabled) score += 5;
  if (settings.notificationsEnabled) score += 5;
  if (settings.simpleLanguageMode) score += 5;

  // Unblocked critical/high threats when protection was OFF reduce score
  const unblockedDangerous = history.filter(
    (r) =>
      !r.userMarkedSafe &&
      (r.analysis.riskLevel === 'CRITICAL' || r.analysis.riskLevel === 'HIGH') &&
      r.protectionAction !== 'Simulated Block & Isolation'
  ).length;
  score -= unblockedDangerous * 10;

  // Being inside an active high-risk zone lowers ambient safety posture slightly until exited/acknowledged
  if (inHighRiskZone) {
    score -= 8;
  }

  const protectionScore = Math.max(15, Math.min(100, score));

  return {
    threatsDetectedToday,
    threatsBlocked,
    messagesAnalyzed,
    reportsPrepared: reportsCount,
    protectionScore,
  };
}
