export interface IGithubReposResponse {
  total_count: number
  incomplete_results: boolean
  items: IGithubRepo[]
}

export interface IGithubRepo {
  name: string
  stargazers_count: number
  language: string
  html_url: string
  created_at: string
}

export interface IReposPublicData {
  last_updated: string
  repos: IGithubRepo[]
}
