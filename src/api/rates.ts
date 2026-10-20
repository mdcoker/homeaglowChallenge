/**
 * Pay-rate API for the applicant onboarding flow.
 *
 * Everything here is mocked. In production these would be authenticated calls, e.g.
 *   GET  /applicants/:id/rate-config
 *   PUT  /applicants/:id/rate
 * The screen only depends on the function signatures and types below, so swapping the mock
 * for a real client (or wrapping these in React Query) doesn't touch the UI.
 */

export type JobEstimateTier = {
  /** Inclusive upper bound of the hourly rate this tier applies to. */
  upToRate: number;
  jobsPerWeek: number;
};

/**
 * How new-client pricing works depends on the applicant's state.
 * - `marketing-fee`: a fixed fee is taken off the rate for new clients (most states).
 * - `custom-rate`: the applicant may optionally set a separate rate for new clients.
 */
export type NewClientRatePolicy =
  | { type: 'marketing-fee'; feePerHour: number }
  | { type: 'custom-rate' };

export type SavedRate = {
  hourlyRate: number;
  /** Only set under the `custom-rate` policy when the applicant opted in. */
  newClientRate: number | null;
};

export type RateConfig = {
  recommendedRate: number;
  minRate: number;
  maxRate: number;
  step: number;
  /**
   * Sent up front (sorted by `upToRate`) so the estimate updates instantly as the rate changes,
   * instead of making a request per tap.
   */
  jobEstimates: JobEstimateTier[];
  newClientPolicy: NewClientRatePolicy;
  /** Present if the applicant already completed this step and came back to it. */
  current: SavedRate | null;
};

export type SubmitRateRequest =
  | { policy: 'marketing-fee'; hourlyRate: number }
  | { policy: 'custom-rate'; hourlyRate: number; newClientRate: number | null };

export class ApiError extends Error {
  constructor(
    message: string,
    /** Whether retrying the same request could succeed (network/5xx vs. validation). */
    readonly retryable: boolean
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ---------------------------------------------------------------------------
// Mock implementation
// ---------------------------------------------------------------------------

/** Flip these while developing to exercise the error states. */
export const mockOptions = {
  latencyMs: 600,
  failFetch: false,
  failSubmit: false,
};

/** Made-up list of states with the alternative new-client pricing rules. */
const CUSTOM_RATE_STATES = new Set(['CA', 'NY', 'WA']);

const BASE_CONFIG: Omit<RateConfig, 'newClientPolicy' | 'current'> = {
  recommendedRate: 20,
  minRate: 15,
  maxRate: 40,
  step: 1,
  jobEstimates: [
    { upToRate: 17, jobsPerWeek: 6 },
    { upToRate: 20, jobsPerWeek: 4 },
    { upToRate: 24, jobsPerWeek: 3 },
    { upToRate: 29, jobsPerWeek: 2 },
    { upToRate: Infinity, jobsPerWeek: 1 },
  ],
};

let savedRate: SavedRate | null = null;

function wait(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new Error('Aborted'));
    });
  });
}

export async function fetchRateConfig(params: {
  applicantId: string;
  /** Two-letter US state code; in production the server would derive this from the applicant. */
  state: string;
  signal?: AbortSignal;
}): Promise<RateConfig> {
  await wait(mockOptions.latencyMs, params.signal);

  if (mockOptions.failFetch) {
    throw new ApiError("We couldn't load your rate details.", true);
  }

  return {
    ...BASE_CONFIG,
    newClientPolicy: CUSTOM_RATE_STATES.has(params.state)
      ? { type: 'custom-rate' }
      : { type: 'marketing-fee', feePerHour: 5 },
    current: savedRate,
  };
}

export async function submitRate(params: {
  applicantId: string;
  request: SubmitRateRequest;
}): Promise<SavedRate> {
  await wait(mockOptions.latencyMs);

  if (mockOptions.failSubmit) {
    throw new ApiError("We couldn't save your rate. Please try again.", true);
  }

  // The server re-validates; the client clamps, but never trust it.
  const { request } = params;
  const rates = [request.hourlyRate];
  if (request.policy === 'custom-rate' && request.newClientRate !== null) {
    rates.push(request.newClientRate);
  }
  if (rates.some((rate) => rate < BASE_CONFIG.minRate || rate > BASE_CONFIG.maxRate)) {
    throw new ApiError(
      `Rates must be between $${BASE_CONFIG.minRate} and $${BASE_CONFIG.maxRate}/hr.`,
      false
    );
  }

  savedRate = {
    hourlyRate: request.hourlyRate,
    newClientRate: request.policy === 'custom-rate' ? request.newClientRate : null,
  };
  return savedRate;
}
