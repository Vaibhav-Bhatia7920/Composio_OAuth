import { useCallback, useEffect, useState } from 'react'
import { generateGuide, getCachedGuide } from './api/generateGuide'
import { GuideDisplay } from './components/GuideDisplay'
import { LibrarySidebar } from './components/LibrarySidebar'
import { TopNav } from './components/TopNav'
import { useAppSearchParam } from './hooks/useAppSearchParam'
import type { OAuthGuide } from './types/guide'

function App() {
  const { appName, setAppName } = useAppSearchParam()
  const [guide, setGuide] = useState<OAuthGuide | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)

  useEffect(() => {
    if (!appName) {
      setGuide(null)
      setError(null)
      setLoading(false)
      return
    }

    const cached = getCachedGuide(appName)
    if (cached) {
      setGuide(cached)
      setError(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    setGuide(null)

    generateGuide(appName)
      .then((data) => {
        if (!cancelled) setGuide(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load guide')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [appName])

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopyFeedback('Copied!')
      window.setTimeout(() => setCopyFeedback(null), 2000)
    } catch {
      setCopyFeedback('Failed')
      window.setTimeout(() => setCopyFeedback(null), 2000)
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav
        initialQuery={appName}
        onSearch={setAppName}
        loading={loading}
      />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col lg:flex-row">
        <LibrarySidebar activeApp={appName} onSelectApp={setAppName} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {!appName && (
            <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-10 text-center">
              <h1 className="text-xl font-semibold text-zinc-200">
                Pick an app to generate a guide
              </h1>
              <p className="mt-2 text-sm text-zinc-500">
                Use the library, search above, or open a shareable link like{' '}
                <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-cyan-400">
                  ?app=GitHub
                </code>
              </p>
            </div>
          )}

          {appName && loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-zinc-400">
              <div
                className="size-8 animate-spin rounded-full border-2 border-zinc-700 border-t-cyan-500"
                aria-hidden
              />
              <p className="font-mono text-sm">
                Researching OAuth docs for {appName}…
              </p>
            </div>
          )}

          {appName && error && !loading && (
            <div
              className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-200"
              role="alert"
            >
              <p className="font-medium">Could not load guide</p>
              <p className="mt-1 text-red-300/80">{error}</p>
            </div>
          )}

          {appName && guide && !loading && (
            <GuideDisplay
              appName={appName}
              guide={guide}
              onCopyLink={handleCopyLink}
              copyFeedback={copyFeedback}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
