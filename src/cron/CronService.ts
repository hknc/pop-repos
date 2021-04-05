import dayjs from "dayjs"
import ReposCache from "../caches/ReposCache"
import { created_ago } from "../services/github.service"
import { masterElector } from "../server"
import logger from "../utils/logger"
import Redis from "../utils/RedisClient"

const CRON_MINUTES = 1
const UPDATE_CACHES_MINUTES = 5

export default class CronService {
  public static init(): void {
    setInterval(() => {
      if (masterElector.isMaster) {
        Promise.all([
          this.updateCaches(UPDATE_CACHES_MINUTES), // update caches periodically
        ]).catch((error) => {
          logger.error("CronService: failed to kick of a cronjob", error.message, error.stack)
        })

        logger.info(`CronService: ${dayjs()}`)
      }
    }, 60 * 1000 * CRON_MINUTES)
  }

  protected static async updateCaches(minutes = 5): Promise<void> {
    const cacheKey = "cron:update-caches:schedule"
    if (await Redis.redis.get(cacheKey)) return // wait for next time

    Promise.all(
      Object.values(created_ago).map((created) => {
        ReposCache.getPopulars(created, true)
      })
    ).catch((error) => {
      logger.error("CronService:updateCaches: failed to update cache", error.message)
    })

    await Redis.redis.setex(cacheKey, minutes * 60, "waitForIt") // set for next schedule
  }
}
