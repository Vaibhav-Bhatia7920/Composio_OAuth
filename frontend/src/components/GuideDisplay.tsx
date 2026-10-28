import type { DifficultyLevel, OAuthGuide } from '../types/guide'

const DIFFICULTY_STYLES: Record<
  DifficultyLevel,
  { badge: string; dot: string; label: string }
> = {
  Easy: {
    badge: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    dot: 'bg-emerald-400',
    label: 'Easy',
  },
  Moderate: {
    badge: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    dot: 'bg-amber-400',
    label: 'Moderate',
  },
  Hard: {
    badge: 'border-red-500/40 bg-red-500/10 text-red-300',
    dot: 'bg-red-400',
    label: 'Hard',
  },
}

function RobotIcon() {
  return (
    <svg
      className="mt-0.5 size-4 shrink-0 text-cyan-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <rect x="5" y="8" width="14" height="12" rx="2" />
      <path d="M9 8V5a3 3 0 0 1 6 0v3" />
      <circle cx="9.5" cy="13" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="13" r="1" fill="currentColor" stroke="none" />
      <path d="M9 17h6" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg
      className="mt-0.5 size-4 shrink-0 text-violet-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    </svg>
  )
}

type GuideDisplayProps = {
  appName: string
  guide: OAuthGuide
  onCopyLink: () => void
  copyFeedback: string | null
}

export function GuideDisplay({
  appName,
  guide,
  onCopyLink,
  copyFeedback,
}: GuideDisplayProps) {
  const difficulty = DIFFICULTY_STYLES[guide.difficulty_level]

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 border-b border-zinc-800 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
            OAuth setup guide
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
            {appName}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${difficulty.badge}`}
            >
              <span className={`size-2 rounded-full ${difficulty.dot}`} />
              {difficulty.label}
            </span>
            <span className="font-mono text-sm text-zinc-400">
              Est. {guide.estimated_time}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onCopyLink}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800"
        >
          <svg
            className="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            aria-hidden
          >
            <path d="M9 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" />
            <rect x="11" y="11" width="10" height="10" rx="2" />
          </svg>
          Copy link
          {copyFeedback ? (
            <span className="text-xs text-emerald-400">{copyFeedback}</span>
          ) : null}
        </button>
      </header>

      <section
        className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5"
        aria-labelledby="prerequisites-heading"
      >
        <h2
          id="prerequisites-heading"
          className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber-200"
        >
          <svg
            className="size-4 text-amber-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
          Prerequisites &amp; blockers
        </h2>
        <ul className="space-y-2 text-sm leading-relaxed text-amber-100/90">
          {guide.prerequisites_and_blockers.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-amber-400">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section
          className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5"
          aria-labelledby="agent-heading"
        >
          <h2
            id="agent-heading"
            className="mb-4 text-sm font-semibold uppercase tracking-wide text-cyan-300"
          >
            Automated by agent
          </h2>
          <ol className="space-y-3">
            {guide.agent_automatable_steps.map((step, index) => (
              <li
                key={`${index}-${step}`}
                className="flex gap-3 text-sm leading-relaxed text-zinc-300"
              >
                <RobotIcon />
                <span>
                  <span className="mr-2 font-mono text-xs text-zinc-500">
                    {index + 1}.
                  </span>
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section
          className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5"
          aria-labelledby="human-heading"
        >
          <h2
            id="human-heading"
            className="mb-4 text-sm font-semibold uppercase tracking-wide text-violet-300"
          >
            Manual developer actions
          </h2>
          <ol className="space-y-3">
            {guide.human_intervention_steps.map((step, index) => (
              <li
                key={`${index}-${step}`}
                className="flex gap-3 text-sm leading-relaxed text-zinc-300"
              >
                <UserIcon />
                <span>
                  <span className="mr-2 font-mono text-xs text-zinc-500">
                    {index + 1}.
                  </span>
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {guide.sources_used.length > 0 ? (
        <section aria-labelledby="sources-heading">
          <h2
            id="sources-heading"
            className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500"
          >
            Sources
          </h2>
          <ul className="space-y-1.5">
            {guide.sources_used.map((url) => (
              <li key={url}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all font-mono text-sm text-zinc-500 transition hover:text-zinc-300"
                >
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
