export class ApiError extends Error {
  public status: number;
  public body?: unknown;

  constructor(
    message: string,
    status: number,
    body?: unknown
  ) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    let body: unknown = undefined;
    try {
      body = await res.json();
    } catch {
      // ignore
    }
    throw new ApiError(`GET ${url} failed`, res.status, body);
  }

  // 204 safeguard (kdyby někde bylo)
  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}

export async function apiPost(url: string): Promise<void> {
  const res = await fetch(url, {
    method: "POST",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    let body: unknown = undefined;
    try {
      body = await res.json();
    } catch { }
    throw new ApiError(`POST ${url} failed`, res.status, body);
  }
}

export async function apiDelete(url: string): Promise<void> {
  const res = await fetch(url, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    let body: unknown = undefined;
    try {
      body = await res.json();
    } catch { }
    throw new ApiError(`DELETE ${url} failed`, res.status, body);
  }
}

export async function apiPut(url: string): Promise<void> {
  const res = await fetch(url, {
    method: "PUT",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    let body: unknown = undefined;
    try {
      body = await res.json();
    } catch { }
    throw new ApiError(`PUT ${url} failed`, res.status, body);
  }
}

export async function apiPostJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`);
  return (await res.json()) as T;
}

export async function apiPutJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${url} failed: ${res.status}`);
  return (await res.json()) as T;
}

