import GitHubService, { created_ago } from "../services/github.service"
import Redis from "../utils/RedisClient"
import { IReposPublicData } from "../interfaces/github.interface"

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

    if (repos) {
      await Redis.redis.set(cacheKey, JSON.stringify(repos))
    }

    return repos
  }
}
