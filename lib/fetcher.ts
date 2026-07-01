/** Default SWR fetcher: GET JSON and throw a friendly error on non-2xx. */
export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || "Failed to load data");
  }
  return res.json();
}
