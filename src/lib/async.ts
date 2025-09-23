import { useCallback, useState } from "react";

export function useAsync<T = unknown, A extends any[] = any[]>(
  fn: (...args: A) => Promise<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setLoading] = useState(false);
  
  const run = useCallback(async (...args: A) => {
    setLoading(true);
    setError(null);
    try {
      const out = await fn(...args);
      setData(out);
      return out;
    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [fn]);
  
  const retry = useCallback(() => {
    if (data) {
      return data;
    }
    throw new Error("No previous successful result to retry");
  }, [data]);
  
  return { run, isLoading, data, error, retry };
}