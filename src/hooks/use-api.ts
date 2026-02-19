import { useState } from "react";

interface UseApiOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useApi<T = unknown>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const fetchData = async (
    url: string,
    options?: RequestInit
  ): Promise<{ data: T | null; error: string | null }> => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(url, options);
      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.message ?? "Request failed";
        setError(errorMessage);
        return { data: null, error: errorMessage };
      }

      return { data, error: null };
    } catch (err) {
      const errorMessage = "Something went wrong" + (err instanceof Error ? `: ${err.message}` : "");
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError("");

  return {
    fetchData,
    loading,
    error,
    clearError,
  };
}

export function useQuery<T = unknown>(url: string, options?: UseApiOptions) {
  const [data, setData] = useState<T | null>(null);
  const { fetchData, loading, error, clearError } = useApi<T>();

  const refetch = async () => {
    const result = await fetchData(url);
    if (result.data) {
      setData(result.data);
      options?.onSuccess?.();
    } else if (result.error) {
      options?.onError?.(result.error);
    }
    return result;
  };

  return {
    data,
    loading,
    error,
    refetch,
    clearError,
  };
}

export function useMutation<TData = unknown, TVariables = unknown>(
  options?: UseApiOptions
) {
  const { fetchData, loading, error, clearError } = useApi<TData>();

  const mutate = async (
    url: string,
    data?: TVariables,
    method: "POST" | "PUT" | "PATCH" | "DELETE" = "POST"
  ) => {
    const result = await fetchData(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (result.data) {
      options?.onSuccess?.();
    } else if (result.error) {
      options?.onError?.(result.error);
    }

    return result;
  };

  return {
    mutate,
    loading,
    error,
    clearError,
  };
}
