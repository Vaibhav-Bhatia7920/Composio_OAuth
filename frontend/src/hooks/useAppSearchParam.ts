import { useCallback, useEffect, useState } from 'react'

function readAppParam(): string {
  return new URLSearchParams(window.location.search).get('app')?.trim() ?? ''
}

export function useAppSearchParam() {
  const [appName, setAppNameState] = useState(readAppParam)

  useEffect(() => {
    const onPopState = () => setAppNameState(readAppParam())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const setAppName = useCallback((name: string) => {
    const trimmed = name.trim()
    const params = new URLSearchParams(window.location.search)
    if (trimmed) {
      params.set('app', trimmed)
    } else {
      params.delete('app')
    }
    const query = params.toString()
    const nextUrl = query
      ? `${window.location.pathname}?${query}`
      : window.location.pathname
    window.history.pushState({}, '', nextUrl)
    setAppNameState(trimmed)
  }, [])

  return { appName, setAppName }
}
