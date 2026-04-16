// githubService.ts — Fetch GitHub profile data with localStorage caching

export interface GitHubRepo {
  name: string
  description: string | null
  html_url: string
  stargazers_count: number
  language: string | null
  updated_at: string
  topics: string[]
}

export interface GitHubProfile {
  repos: GitHubRepo[]
  languages: Record<string, number>
  totalStars: number
  fetchedAt: number
}

const CACHE_KEY = 'abhiverse_gh_cache'
const CACHE_TTL = 60 * 60 * 1000 // 1 hour
const GITHUB_USERNAME = 'sriramojuabhiram'

/** Rename map: GitHub repo name → desired display name + URL */
const REPO_RENAMES: Record<string, { name: string; html_url: string }> = {
  'neural-nexus': { name: 'abhiverse', html_url: 'https://github.com/sriramojuabhiram/abhiverse' },
}

/** Extra repos to always include (e.g. private/new repos not yet returned by API) */
const EXTRA_REPOS: GitHubRepo[] = [
  {
    name: 'ai-buddy-path',
    description: 'Gamified 30-day AI mastery platform with roadmap, AI coach, prompt factory, career hub, mock interviews, app builder, certifications, and leaderboard',
    html_url: 'https://github.com/sriramojuabhiram/ai-buddy-path',
    stargazers_count: 0,
    language: 'TypeScript',
    updated_at: new Date().toISOString(),
    topics: ['ai', 'gamification', 'education'],
  },
]

function applyRenames(profile: GitHubProfile): GitHubProfile {
  for (const repo of profile.repos) {
    const rename = REPO_RENAMES[repo.name]
    if (rename) {
      repo.name = rename.name
      repo.html_url = rename.html_url
    }
  }
  // Merge in extra repos if not already present
  for (const extra of EXTRA_REPOS) {
    if (!profile.repos.some((r) => r.name === extra.name)) {
      profile.repos.push(extra)
    }
  }
  return profile
}

function getCached(): GitHubProfile | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const data: GitHubProfile = JSON.parse(raw)
    if (Date.now() - data.fetchedAt > CACHE_TTL) return null
    return applyRenames(data)
  } catch {
    return null
  }
}

function setCache(data: GitHubProfile): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch { /* quota exceeded — ignore */ }
}

export async function fetchGitHubProfile(): Promise<GitHubProfile> {
  const cached = getCached()
  if (cached) return cached

  const username = (import.meta.env.VITE_GITHUB_USERNAME as string) || GITHUB_USERNAME

  try {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated&type=public`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      },
    )

    if (!res.ok) {
      throw new Error(`GitHub API returned ${res.status}`)
    }

    const repos: GitHubRepo[] = await res.json()

    // Apply repo renames
    for (const repo of repos) {
      const rename = REPO_RENAMES[repo.name]
      if (rename) {
        repo.name = rename.name
        repo.html_url = rename.html_url
      }
    }

    // Merge in extra repos if not already present
    for (const extra of EXTRA_REPOS) {
      if (!repos.some((r) => r.name === extra.name)) {
        repos.push(extra)
      }
    }

    // Aggregate languages
    const languages: Record<string, number> = {}
    let totalStars = 0
    for (const repo of repos) {
      totalStars += repo.stargazers_count
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1
      }
    }

    const profile: GitHubProfile = {
      repos: repos.slice(0, 30), // Top 30 most recent
      languages,
      totalStars,
      fetchedAt: Date.now(),
    }

    setCache(profile)
    return profile
  } catch (err) {
    // Return empty profile on failure — don't break the app
    console.warn('GitHub fetch failed:', err)
    return {
      repos: [],
      languages: {},
      totalStars: 0,
      fetchedAt: Date.now(),
    }
  }
}

/** Map language to glow color for skill nodes */
export const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#ffd43b',
  TypeScript: '#3178c6',
  Python: '#306998',
  Go: '#00ADD8',
  Java: '#b07219',
  'C#': '#178600',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Dockerfile: '#384d54',
  Jupyter: '#F37726',
  Rust: '#dea584',
  Ruby: '#701516',
}
