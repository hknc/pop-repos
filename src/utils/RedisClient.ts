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
    const inst = new redis(Env.get("REDIS_URL", "redis://redis"))

    inst.on("ready", () => logger.info("redis connected"))
    inst.on("error", (error) => logger.error(`redis threw an error: ${error.message}`, error.stack))

    return inst
  }
}
