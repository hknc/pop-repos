import GitHubService, { created_ago } from "../services/github.service"
import Redis from "../utils/RedisClient"
import { IReposPublicData } from "../interfaces/github.interface"

export default class ReposCache {
  public static getPopulars = async (
    createdAgo: created_ago = created_ago.ALL_TIME,
    language: null | string = null,
    reset = false
  ): Promise<IReposPublicData> => {
    const cacheKey = language ? `repos:${createdAgo}:${language}` : `repos:${createdAgo}`

    if (!reset) {
      const cache = await Redis.redis.get(cacheKey)

      if (cache) {
        return JSON.parse(cache) as IReposPublicData
      }
    }

    // set cache if it's missing or resetting
    const reposData = await GitHubService.getPopRepos(createdAgo, language)

    if (reposData?.repos?.length > 0) {
      await Redis.redis.set(cacheKey, JSON.stringify(reposData))
    }

    // save the language so cron job can update it
    if (reposData?.repos?.length > 0 && language) {
      await Redis.redis.sadd("languages", language)
    }

    return reposData
  }
}
