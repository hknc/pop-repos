import GitHubService, { created_ago } from "../services/github.service"
import Redis from "../utils/RedisClient"
import { IGithubRepo, IReposPublicData } from "../interfaces/github.interface"
import dayjs from "dayjs"

const stripData = (repos: IGithubRepo[]) => {
  return repos.map(({ name, stargazers_count, language, html_url, created_at }) => {
    return { name, stargazers_count, language, html_url, created_at }
  })
}

export default class ReposCache {
  public static getPopulars = async (
    createdAgo: created_ago = created_ago.ALL_TIME,
    reset = false
  ): Promise<IReposPublicData> => {
    const cacheKey = `repos:${createdAgo}`

    if (!reset) {
      const cache = await Redis.redis.get(cacheKey)

      if (cache) {
        return JSON.parse(cache) as IReposPublicData
      }
    }

    // set cache if it's missing or resetting
    const repos = await GitHubService.getPopRepos(createdAgo)

    const data: IReposPublicData = {
      last_updated: dayjs().toISOString(),
      repos: stripData(repos.items),
    }

    if (repos) {
      await Redis.redis.set(cacheKey, JSON.stringify(data))
    }

    return data
  }
}
