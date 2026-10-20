import { clampRate, estimateJobsPerWeek, formatRate, rateAfterFee } from '../rateMath';

describe('clampRate', () => {
  const bounds = { minRate: 15, maxRate: 40 };

  it('keeps rates inside the bounds unchanged', () => {
    expect(clampRate(20, bounds)).toBe(20);
  });

  it('raises rates below the minimum', () => {
    expect(clampRate(10, bounds)).toBe(15);
  });

  it('lowers rates above the maximum', () => {
    expect(clampRate(50, bounds)).toBe(40);
  });
});

describe('estimateJobsPerWeek', () => {
  const tiers = [
    { upToRate: 17, jobsPerWeek: 6 },
    { upToRate: 20, jobsPerWeek: 4 },
    { upToRate: 29, jobsPerWeek: 2 },
  ];

  it('uses the first tier whose upper bound covers the rate', () => {
    expect(estimateJobsPerWeek(15, tiers)).toBe(6);
    expect(estimateJobsPerWeek(18, tiers)).toBe(4);
  });

  it('treats tier bounds as inclusive', () => {
    expect(estimateJobsPerWeek(20, tiers)).toBe(4);
  });

  it('falls back to the last tier for rates above every bound', () => {
    expect(estimateJobsPerWeek(35, tiers)).toBe(2);
  });

  it('returns 0 when there are no tiers', () => {
    expect(estimateJobsPerWeek(20, [])).toBe(0);
  });
});

describe('rateAfterFee', () => {
  it('subtracts the fee', () => {
    expect(rateAfterFee(20, 5)).toBe(15);
  });

  it('never goes below zero', () => {
    expect(rateAfterFee(3, 5)).toBe(0);
  });
});

describe('formatRate', () => {
  it('omits cents for whole dollars', () => {
    expect(formatRate(20)).toBe('$20');
  });

  it('shows two decimal places otherwise', () => {
    expect(formatRate(20.5)).toBe('$20.50');
  });
});
