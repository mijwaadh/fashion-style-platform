const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function getToken(): string | null {
    try {
        const stored = localStorage.getItem('aura_user');
        if (!stored) return null;
        return JSON.parse(stored)?.token ?? null;
    } catch {
        return null;
    }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    console.log('API Request:', path, 'Token present:', !!token);
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
    };

    const res = await fetch(`${API_URL}${path}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) {
        console.error('API Error:', res.status, data);
        throw new Error(data.message || `Request failed: ${res.status}`);
    }
    return data as T;
}

export const api = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
    put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
    patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

let cachedSavedIds: string[] | null = null;
let savedIdsPromise: Promise<string[]> | null = null;

export const getSavedLookIds = (): Promise<string[]> => {
    const token = getToken();
    if (!token) return Promise.resolve([]);
    if (cachedSavedIds) return Promise.resolve(cachedSavedIds);
    if (savedIdsPromise) return savedIdsPromise;

    savedIdsPromise = api.get<{ _id: string | number }[]>('/api/users/saves')
        .then(looks => {
            cachedSavedIds = looks.map(l => l._id.toString());
            return cachedSavedIds;
        })
        .catch(() => []);
    return savedIdsPromise;
};

export const clearSavedLookCache = () => {
    cachedSavedIds = null;
    savedIdsPromise = null;
};
