import type { OAuthGuide } from '../types/guide'

/** Same-origin `/api` — proxied to the backend in dev (vite.config) or by your deploy reverse proxy. */
const GENERATE_GUIDE_URL = '/api/v1/generate-guide'

const guideCache = new Map<string, OAuthGuide>()

function guideCacheKey(appName: string): string {
  return appName.trim().toLowerCase()
}

export function getCachedGuide(appName: string): OAuthGuide | undefined {
  return guideCache.get(guideCacheKey(appName))
}

export async function generateGuide(appName: string): Promise<OAuthGuide> {
  const cached = getCachedGuide(appName)
  if (cached) {
    return cached
  }

  let response: Response
  try {
    response = await fetch(GENERATE_GUIDE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_name: appName }),
    })
  } catch {
    throw new Error(
      'Cannot reach the API. Start the backend on port 8000 (e.g. `make up` or `uvicorn main:app --reload` in backend/).',
    )
  }

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

  const guide = (await response.json()) as OAuthGuide
  guideCache.set(guideCacheKey(appName), guide)
  return guide
}
