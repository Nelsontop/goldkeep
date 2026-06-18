const BASE = '/api'

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token')
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: authHeaders() })
  if (!res.ok) throw new Error((await res.json()).detail || res.statusText)
  return res.json()
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = authHeaders()
  const isFormData = body instanceof FormData
  if (!isFormData) headers['Content-Type'] = 'application/json'
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers,
    body: isFormData ? (body as FormData) : JSON.stringify(body),
  })
  if (!res.ok) throw new Error((await res.json()).detail || res.statusText)
  return res.json()
}

export async function apiPut<T>(path: string, body: FormData): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: authHeaders(),
    body,
  })
  if (!res.ok) throw new Error((await res.json()).detail || res.statusText)
  return res.json()
}

export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error((await res.json()).detail || res.statusText)
}
