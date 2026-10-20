import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useRateConfig } from '../useRateConfig';

import * as api from '~/api/rates';

beforeEach(() => api.resetMockApi({ latencyMs: 0, failFetch: false, failSubmit: false }));
afterEach(() => jest.restoreAllMocks());

describe('useRateConfig', () => {
  it('starts loading, then returns the config', async () => {
    const { result } = await renderHook(() => useRateConfig('applicant-123', 'TX'));

    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current).toMatchObject({
      config: { newClientPolicy: { type: 'marketing-fee' } },
    });
  });

  it('surfaces ApiError messages', async () => {
    api.mockOptions.failFetch = true;

    const { result } = await renderHook(() => useRateConfig('applicant-123', 'TX'));

    await waitFor(() =>
      expect(result.current).toMatchObject({
        status: 'error',
        message: "We couldn't load your rate details.",
      })
    );
  });

  it('uses a generic message for unexpected errors', async () => {
    jest.spyOn(api, 'fetchRateConfig').mockRejectedValueOnce(new Error('socket hang up'));

    const { result } = await renderHook(() => useRateConfig('applicant-123', 'TX'));

    await waitFor(() =>
      expect(result.current).toMatchObject({ status: 'error', message: 'Something went wrong.' })
    );
  });

  it('goes back to loading and refetches on retry', async () => {
    api.mockOptions.failFetch = true;
    const { result } = await renderHook(() => useRateConfig('applicant-123', 'TX'));
    await waitFor(() => expect(result.current.status).toBe('error'));

    api.mockOptions.failFetch = false;
    await act(async () => result.current.retry());

    await waitFor(() => expect(result.current.status).toBe('success'));
  });

  it('refetches when the applicant state changes', async () => {
    const fetchSpy = jest.spyOn(api, 'fetchRateConfig');
    const { result, rerender } = await renderHook(
      ({ state }: { state: string }) => useRateConfig('applicant-123', state),
      { initialProps: { state: 'TX' } }
    );
    await waitFor(() => expect(result.current.status).toBe('success'));

    await rerender({ state: 'CA' });

    await waitFor(() =>
      expect(result.current).toMatchObject({ config: { newClientPolicy: { type: 'custom-rate' } } })
    );
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('aborts the request on unmount and ignores the result', async () => {
    api.mockOptions.latencyMs = 60_000;
    const fetchSpy = jest.spyOn(api, 'fetchRateConfig');
    const { result, unmount } = await renderHook(() => useRateConfig('applicant-123', 'TX'));
    const { signal } = fetchSpy.mock.calls[0][0];

    await unmount();

    expect(signal?.aborted).toBe(true);
    // Let the rejected request settle; the hook must not report it as an error.
    await act(async () => {});
    expect(result.current.status).toBe('loading');
  });
});
