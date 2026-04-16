import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetchJson } from "../lib/api";
import type {
  CheckInResponses,
  CheckInSessionDto,
} from "../types/checkIn";

type UseCheckInSessionResult = {
  session: CheckInSessionDto | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  submit: (responses: CheckInResponses) => Promise<CheckInSessionDto>;
};

export function useCheckInSession(token: string): UseCheckInSessionResult {
  const [session, setSession] = useState<CheckInSessionDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (token.trim().length === 0) {
      setLoading(false);
      setError("Missing check-in token");
      setSession(null);
      return;
    }

    setLoading(true);
    setError(null);

    const fetched = await apiFetchJson<CheckInSessionDto>(
      `/api/check-ins/session/${token}`,
    );

    setSession(fetched);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    void refresh().catch((err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to load check-in";
      setError(message);
      setLoading(false);
    });
  }, [refresh]);

  const submit = useCallback(
    async (responses: CheckInResponses) => {
      const result = await apiFetchJson<CheckInSessionDto>(
        `/api/check-ins/session/${token}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(responses),
        },
      );

      setSession(result);
      return result;
    },
    [token],
  );

  const value = useMemo(
    () => ({
      session,
      loading,
      error,
      refresh,
      submit,
    }),
    [error, loading, refresh, session, submit],
  );

  return value;
}

