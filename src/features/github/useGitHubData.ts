// useGitHubData.ts — React hook for GitHub profile data with lazy loading
import { useState, useEffect } from 'react'
import { fetchGitHubProfile, type GitHubProfile } from '../../services/githubService'

export function useGitHubData() {
  const [data, setData] = useState<GitHubProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetchGitHubProfile()
      .then((profile) => {
        if (!cancelled) {
          setData(profile)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError((err as Error).message)
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [])

  return { data, loading, error }
}
