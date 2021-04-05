import logger from "../utils/logger"
import { githubClient } from "../utils/HttpClient"
import { IGithubRepo, IGithubReposResponse, IReposPublicData } from "../interfaces/github.interface"
import dayjs from "dayjs"
import GitHubServiceException from "../exceptions/GitHubServiceException"
import Redis from "../utils/RedisClient"

const API_LOCK_SECONDS = 60

export enum created_ago {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  YEAR = "year",
  ALL_TIME = "allTime",
}

const stripData = (repos: IGithubRepo[]) => {
  return repos.map(({ name, stargazers_count, language, html_url, created_at }) => {
    return { name, stargazers_count, language, html_url, created_at }
  })
}

export default class GitHubService {
  private static reposPath = "/repositories"
  private static apiLockKey = "api:lock"

  private static isApiLocked = async () => {
    if (await Redis.redis.get(GitHubService.apiLockKey)) {
      logger.info("GitHubService: api is locked")
      return true
    }
    return false
  }

  private static lockApi = async (apiRemaining: number) => {
    if (apiRemaining && apiRemaining < 1) {
      await Redis.redis.setex(GitHubService.apiLockKey, API_LOCK_SECONDS, "locked")
      return true
    }
    return false
  }

  private static getParams = (q: string, sort = "stars", order = "desc", per_page = 100, page = 1) => {
    return { q, sort, order, per_page, page }
  }

  public static getPopRepos = async (
    createdAgo: created_ago,
    language: string | null = null
  ): Promise<IReposPublicData | void> => {
    // cancel if api limit exceeded
    if (await GitHubService.isApiLocked()) return

    let dateQuery

    if (createdAgo !== created_ago.ALL_TIME) {
      dateQuery = `created:">${dayjs().subtract(1, createdAgo).format("YYYY-MM-DD")}"`
    }

    let query: string = dateQuery ? `stars:>=1 ${dateQuery}` : "stars:>=1"

    if (language) {
      query = dateQuery ? `language:${language} ${dateQuery}` : `language:${language}`
    }

    const params = GitHubService.getParams(query)

    try {
      const reposResponse = await githubClient.get<IGithubReposResponse>(`${GitHubService.reposPath}`, { params })

      logger.info(
        "api call",
        { params },
        {
          incomplete_results: reposResponse.data.incomplete_results,
          repos: reposResponse.data.items.length,
          ratelimit: {
            limit: reposResponse.headers["x-ratelimit-limit"],
            remaining: reposResponse.headers["x-ratelimit-remaining"],
          },
        }
      )

      const data: IReposPublicData = {
        last_updated: dayjs().toISOString(),
        repos: stripData(reposResponse?.data?.items),
      }

      GitHubService.lockApi(+reposResponse.headers["x-ratelimit-remaining"])

      return data
    } catch (error) {
      logger.error("api call error", { params }, error.message)
      return {
        last_updated: dayjs().toISOString(),
        repos: [],
      }
    }
  }
}
