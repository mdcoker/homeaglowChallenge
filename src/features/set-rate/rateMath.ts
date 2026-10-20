import type { JobEstimateTier } from '~/api/rates';

export function clampRate(rate: number, bounds: { minRate: number; maxRate: number }) {
  return Math.min(bounds.maxRate, Math.max(bounds.minRate, rate));
}

export function estimateJobsPerWeek(rate: number, tiers: JobEstimateTier[]) {
  const tier = tiers.find((t) => rate <= t.upToRate) ?? tiers[tiers.length - 1];
  return tier?.jobsPerWeek ?? 0;
}

export function rateAfterFee(rate: number, feePerHour: number) {
  return Math.max(0, rate - feePerHour);
}

export function formatRate(rate: number) {
  return Number.isInteger(rate) ? `$${rate}` : `$${rate.toFixed(2)}`;
}
