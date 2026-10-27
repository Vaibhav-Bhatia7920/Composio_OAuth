const LIBRARY_APPS = ['Slack', 'GitHub', 'Notion'] as const

type LibrarySidebarProps = {
  activeApp: string
  onSelectApp: (app: string) => void
}

export function LibrarySidebar({ activeApp, onSelectApp }: LibrarySidebarProps) {
  return (
    <aside
      className="w-full shrink-0 border-b border-zinc-800 bg-zinc-950 lg:w-56 lg:border-b-0 lg:border-r"
      aria-label="App library"
    >
      <div className="p-4 lg:sticky lg:top-14">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-zinc-500">
          Library
        </p>
        <nav className="flex gap-2 lg:flex-col">
          {LIBRARY_APPS.map((app) => {
            const isActive =
              activeApp.toLowerCase() === app.toLowerCase()
            return (
              <button
                key={app}
                type="button"
                onClick={() => onSelectApp(app)}
                className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                  isActive
                    ? 'bg-zinc-800 text-zinc-50 ring-1 ring-zinc-600'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                {app}
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
