import { NextFunction, Response } from "express"
import { ValidatedRequest } from "express-joi-validation"
import { created_ago } from "../services/github.service"
import ReposCache from "../caches/ReposCache"
import { GetReposRequestSchema } from "./validation/repos.validation"
import Redis from "../utils/RedisClient"

export default class ReposController {
  public getRepos = async (
    req: ValidatedRequest<GetReposRequestSchema>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { created, limit, language } = req.query

      let data = await ReposCache.getPopulars(created as created_ago, language)

      if (limit) {
        const { repos } = data
        const limitedRepos = repos.slice(0, limit)
        data = { ...data, repos: limitedRepos }
      }

      res.json(data)
    } catch (error) {
      next(error)
    }
  }
}
