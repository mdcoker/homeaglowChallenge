import { useCallback, useEffect, useState } from 'react';

import { ApiError, fetchRateConfig, type RateConfig } from '~/api/rates';

type RateConfigState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; config: RateConfig };

/**
 * Loads the rate config for an applicant. Hand-rolled to avoid a dependency; in a real app
 * this would be a React Query `useQuery` (caching, retries, refetch on focus for free).
 */
export function useRateConfig(applicantId: string, state: string) {
  const [result, setResult] = useState<RateConfigState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetchRateConfig({ applicantId, state, signal: controller.signal })
      .then((config) => setResult({ status: 'success', config }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setResult({
          status: 'error',
          message: error instanceof ApiError ? error.message : 'Something went wrong.',
        });
      });

    return () => controller.abort();
  }, [applicantId, state, attempt]);

  const retry = useCallback(() => {
    setResult({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  return { ...result, retry };
}
