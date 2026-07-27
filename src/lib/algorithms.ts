// Intelligent JavaScript algorithms used by AquaSense AI
// - Threshold detection
// - Moving average
// - Linear regression
// - Trend analysis
// - Risk score
// - Z-score outlier detection

export function movingAverage(values: number[], window = 5): number[] {
  const out: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = values.slice(start, i + 1);
    out.push(slice.reduce((a, b) => a + b, 0) / slice.length);
  }
  return out;
}

export function linearRegression(values: number[]): { slope: number; intercept: number } {
  const n = values.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  const xs = Array.from({ length: n }, (_, i) => i);
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((s, x, i) => s + x * values[i], 0);
  const sumX2 = xs.reduce((s, x) => s + x * x, 0);
  const denom = n * sumX2 - sumX * sumX || 1;
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

export function zScoreOutliers(values: number[], threshold = 2): number[] {
  const mean = values.reduce((a, b) => a + b, 0) / (values.length || 1);
  const variance =
    values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length || 1);
  const std = Math.sqrt(variance) || 1;
  return values
    .map((v, i) => ({ i, z: Math.abs((v - mean) / std) }))
    .filter((o) => o.z > threshold)
    .map((o) => o.i);
}

export function thresholdBreaches(
  values: number[],
  min: number,
  max: number,
): number[] {
  return values.reduce<number[]>((acc, v, i) => {
    if (v < min || v > max) acc.push(i);
    return acc;
  }, []);
}

export interface RiskInput {
  pressure: number; // bar
  flow: number; // L/min
  ageYears: number;
  leakHistory: number;
  maintenanceGapDays: number;
}

export function riskScore(input: RiskInput): number {
  // 0 (healthy) - 100 (critical)
  const pressurePenalty = Math.min(30, Math.abs(input.pressure - 4.5) * 12);
  const flowPenalty = Math.min(20, Math.abs(input.flow - 220) / 20);
  const agePenalty = Math.min(20, input.ageYears * 0.8);
  const historyPenalty = Math.min(20, input.leakHistory * 5);
  const gapPenalty = Math.min(10, input.maintenanceGapDays / 40);
  return Math.round(
    pressurePenalty + flowPenalty + agePenalty + historyPenalty + gapPenalty,
  );
}

export function healthScore(risk: number): number {
  return Math.max(0, 100 - risk);
}

export function statusFromRisk(risk: number): "healthy" | "warning" | "critical" {
  if (risk >= 65) return "critical";
  if (risk >= 35) return "warning";
  return "healthy";
}

export function failureProbability(risk: number): number {
  // Logistic curve
  const x = (risk - 50) / 12;
  const p = 1 / (1 + Math.exp(-x));
  return Math.round(p * 100);
}

export function predictedMaintenanceDate(risk: number): Date {
  const daysAhead = Math.max(3, Math.round(120 - risk));
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d;
}

export function confidenceScore(sampleSize: number, variance: number): number {
  const size = Math.min(1, sampleSize / 200);
  const stab = Math.max(0, 1 - variance / 100);
  return Math.round(((size * 0.6 + stab * 0.4) * 100));
}
