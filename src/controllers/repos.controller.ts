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

      const data = await ReposCache.getPopulars(created as created_ago)

      res.json(data)
    } catch (error) {
      next(error)
    }
  }
}
