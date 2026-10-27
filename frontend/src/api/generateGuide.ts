import type { OAuthGuide } from '../types/guide'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export async function generateGuide(appName: string): Promise<OAuthGuide> {
  const response = await fetch(`${API_BASE}/api/v1/generate-guide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_name: appName }),
  })

  if (!response.ok) {
    let detail = `Request failed (${response.status})`
    try {
      const body = (await response.json()) as { detail?: string | { msg?: string }[] }
      if (typeof body.detail === 'string') {
        detail = body.detail
      } else if (Array.isArray(body.detail) && body.detail[0]?.msg) {
        detail = body.detail[0].msg
      }
    } catch {
      /* ignore parse errors */
    }
    throw new Error(detail)
  }

  return response.json() as Promise<OAuthGuide>
}
