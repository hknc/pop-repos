import dayjs from "dayjs"
import Joi, { Schema } from "joi"
import logger from "../utils/logger"
import { githubClient } from "../utils/HttpClient"
import { IGithubRepo, IGithubReposResponse, IReposPublicData } from "../interfaces/github.interface"
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

const reposSchema = Joi.object({
  total_count: Joi.number().required(),
  incomplete_results: Joi.boolean().required(),
  items: Joi.array().items({
    name: Joi.string().required(),
    stargazers_count: Joi.number().required(),
    language: Joi.string().allow(null),
    html_url: Joi.string().required(),
    created_at: Joi.string().required(),
  }),
})

const valiadateAndStripData = (schema: Schema, data: IGithubReposResponse): IGithubRepo[] => {
  const validated = schema.validate(data, { stripUnknown: true })

  if (validated.error) {
    throw new GitHubServiceException("GitHubService: failed api data validation")
  }

  return validated.value.items
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

      const data = {
        last_updated: dayjs().toISOString(),
        repos: valiadateAndStripData(reposSchema, reposResponse?.data),
      }

      await GitHubService.lockApi(+reposResponse.headers["x-ratelimit-remaining"])

      return data
    } catch (error) {
      logger.error("api call error", { params }, { message: error.message, data: error.response.data })
      return {
        last_updated: dayjs().toISOString(),
        repos: [],
      }
    }
  }
}
