import redis from "ioredis"
import logger from "./logger"
import Env from "./Env"

export default class Redis {
  public static redis: redis.Redis

  public static init(): void {
    if (!Redis.redis) {
      Redis.redis = this.create()
    }
  }

  public static create(): redis.Redis {
    const options: redis.RedisOptions = {
      port: +Env.get("REDIS_PORT", 6379),
      host: Env.get("REDIS_HOST", "redis"),
      password: Env.get("REDIS_PASS", ""),
      db: +Env.get("REDIS_DB", 0),
    }

    const inst = new redis(options)

    inst.on("ready", () => logger.info("redis connected"))
    inst.on("error", (error) => logger.error(`redis threw an error: ${error.message}`, error.stack))

    return inst
  }
}
