const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

interface FetchOptions extends RequestInit {
    token?: string | null;
    sessionId?: string | null;
}

function buildHeaders(options: FetchOptions): Record<string, string> {
    const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    };
    if (options.token) headers['Authorization'] = `Bearer ${options.token}`;
    if (options.sessionId) headers['X-Session-Id'] = options.sessionId;
    return headers;
}

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
    const { token, sessionId, ...rest } = options;

    const res = await fetch(`${BASE_URL}${path}`, {
        ...rest,
        headers: {
            ...buildHeaders({ token, sessionId }),
            ...(rest.headers as Record<string, string> | undefined),
        },
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.message ?? `Request failed: ${res.status}`);
    }

    return data as T;
}

export const api = {
    get: <T>(path: string, options?: FetchOptions) =>
        apiFetch<T>(path, { method: 'GET', ...options }),

    post: <T>(path: string, body: unknown, options?: FetchOptions) =>
        apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body), ...options }),

    put: <T>(path: string, body: unknown, options?: FetchOptions) =>
        apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body), ...options }),

    patch: <T>(path: string, body: unknown, options?: FetchOptions) =>
        apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body), ...options }),

    del: <T>(path: string, options?: FetchOptions) =>
        apiFetch<T>(path, { method: 'DELETE', ...options }),
};
