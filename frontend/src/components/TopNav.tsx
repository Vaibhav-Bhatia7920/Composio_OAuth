import { useEffect, useState, type FormEvent } from 'react'

type TopNavProps = {
  initialQuery: string
  onSearch: (appName: string) => void
  loading: boolean
}

export function TopNav({ initialQuery, onSearch, loading }: TopNavProps) {
  const [query, setQuery] = useState(initialQuery)

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    onSearch(trimmed)
  }

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="flex size-8 items-center justify-center rounded-md bg-cyan-500/15 font-mono text-xs font-bold text-cyan-400 ring-1 ring-cyan-500/30"
            aria-hidden
          >
            O
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-100">
              OAuth Guide
            </p>
            <p className="truncate font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              Composio APM
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="ml-auto flex min-w-0 flex-1 max-w-md gap-2">
          <label htmlFor="app-search" className="sr-only">
            Search app
          </label>
          <input
            id="app-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search app (e.g. Linear)"
            className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 outline-none ring-cyan-500/0 transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="shrink-0 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? '…' : 'Go'}
          </button>
        </form>
      </div>
    </header>
  )
}
