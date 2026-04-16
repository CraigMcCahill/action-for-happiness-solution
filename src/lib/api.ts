export type ApiError = {
  error: string;
};

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as unknown;
  return data as T;
}

export async function apiFetchJson<TResponse>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<TResponse> {
  const response = await fetch(input, init);

  if (!response.ok) {
    const fallback = `Request failed with status ${response.status}`;
    try {
      const errorBody = (await parseJson<ApiError>(response)) as ApiError;
      throw new Error(errorBody.error || fallback);
    } catch {
      throw new Error(fallback);
    }
  }

  return parseJson<TResponse>(response);
}

