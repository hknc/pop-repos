import { NextFunction, Request, Response } from "express"
import logger from "../utils/logger"
import Redis from "../utils/RedisClient"

class IndexController {
  public getIndex = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const foo = await Redis.redis?.get("foo")
      logger.info(foo)
      res.json({ status: "OK" })
    } catch (error) {
      next(error)
    }
  }
}

export default IndexController
