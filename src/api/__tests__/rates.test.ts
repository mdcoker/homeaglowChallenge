import {
  ApiError,
  fetchRateConfig,
  mockOptions,
  resetMockApi,
  submitRate,
  type SubmitRateRequest,
} from '../rates';

const applicantId = 'applicant-123';

beforeEach(() => resetMockApi({ latencyMs: 0 }));

describe('fetchRateConfig', () => {
  it('returns the marketing-fee policy for most states', async () => {
    const config = await fetchRateConfig({ applicantId, state: 'TX' });

    expect(config.newClientPolicy).toEqual({ type: 'marketing-fee', feePerHour: 5 });
    expect(config).toMatchObject({ recommendedRate: 20, minRate: 15, maxRate: 40, step: 1 });
    expect(config.current).toBeNull();
  });

  it.each(['CA', 'NY', 'WA'])('returns the custom-rate policy for %s', async (state) => {
    const config = await fetchRateConfig({ applicantId, state });

    expect(config.newClientPolicy).toEqual({ type: 'custom-rate' });
  });

  it('includes the previously saved rate', async () => {
    await submitRate({ applicantId, request: { policy: 'marketing-fee', hourlyRate: 22 } });

    const config = await fetchRateConfig({ applicantId, state: 'TX' });

    expect(config.current).toEqual({ hourlyRate: 22, newClientRate: null });
  });

  it('throws a retryable ApiError when failFetch is set', async () => {
    mockOptions.failFetch = true;

    const error = await fetchRateConfig({ applicantId, state: 'TX' }).catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      name: 'ApiError',
      message: "We couldn't load your rate details.",
      retryable: true,
    });
  });

  it('rejects without waiting for the latency when aborted', async () => {
    mockOptions.latencyMs = 60_000;
    const controller = new AbortController();

    const request = fetchRateConfig({ applicantId, state: 'TX', signal: controller.signal });
    controller.abort();

    await expect(request).rejects.toThrow('Aborted');
  });
});

describe('submitRate', () => {
  it('saves a marketing-fee rate without a new-client rate', async () => {
    const saved = await submitRate({
      applicantId,
      request: { policy: 'marketing-fee', hourlyRate: 25 },
    });

    expect(saved).toEqual({ hourlyRate: 25, newClientRate: null });
  });

  it('saves a custom new-client rate', async () => {
    const saved = await submitRate({
      applicantId,
      request: { policy: 'custom-rate', hourlyRate: 25, newClientRate: 30 },
    });

    expect(saved).toEqual({ hourlyRate: 25, newClientRate: 30 });
  });

  it('saves a custom-rate submission with the toggle off', async () => {
    const saved = await submitRate({
      applicantId,
      request: { policy: 'custom-rate', hourlyRate: 25, newClientRate: null },
    });

    expect(saved).toEqual({ hourlyRate: 25, newClientRate: null });
  });

  it('throws a retryable ApiError when failSubmit is set', async () => {
    mockOptions.failSubmit = true;

    const error = await submitRate({
      applicantId,
      request: { policy: 'marketing-fee', hourlyRate: 20 },
    }).catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.retryable).toBe(true);
  });

  it.each<[string, SubmitRateRequest]>([
    ['hourly rate below the minimum', { policy: 'marketing-fee', hourlyRate: 14 }],
    ['hourly rate above the maximum', { policy: 'marketing-fee', hourlyRate: 41 }],
    ['new-client rate out of range', { policy: 'custom-rate', hourlyRate: 20, newClientRate: 100 }],
  ])('rejects a %s with a non-retryable ApiError', async (_, request) => {
    const error = await submitRate({ applicantId, request }).catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      message: 'Rates must be between $15 and $40/hr.',
      retryable: false,
    });
  });

  it('does not save a rejected submission', async () => {
    await submitRate({ applicantId, request: { policy: 'marketing-fee', hourlyRate: 99 } }).catch(
      () => {}
    );

    const config = await fetchRateConfig({ applicantId, state: 'TX' });

    expect(config.current).toBeNull();
  });
});

describe('resetMockApi', () => {
  it('restores default options and clears the saved rate', async () => {
    await submitRate({ applicantId, request: { policy: 'marketing-fee', hourlyRate: 22 } });
    mockOptions.failFetch = true;

    resetMockApi();

    expect(mockOptions).toEqual({ latencyMs: 600, failFetch: false, failSubmit: false });
    resetMockApi({ latencyMs: 0 });
    expect((await fetchRateConfig({ applicantId, state: 'TX' })).current).toBeNull();
  });
});
