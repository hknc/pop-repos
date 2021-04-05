import redis from "ioredis"
import { v4 as uuid } from "uuid"

import { EventEmitter } from "events"
import { setInterval } from "timers"
import Redis from "./RedisClient"
import logger from "./logger"

/**
 * master elector using the poorman’s master election
 * doesn’t require a scheduler or a master instance just using Redis
 *
 * isMaster will let us know if this instance is the current master
 *
 */
export default class MasterElector extends EventEmitter {
  public isMaster = false

  protected name: string
  protected skew: number
  protected myUUID: string

  protected timer!: NodeJS.Timeout

  protected redis: redis.Redis

  /**
   *
   * @param name
   * @param redisInstance
   */
  constructor(name: string, redisInstance?: redis.Redis) {
    super()

    this.name = name

    // dice a skew and a UUID
    this.myUUID = uuid()
    this.skew = Math.floor(Math.random() * 15)

    this.redis = redisInstance || Redis.create()

    logger.info("MasterElector: election parameters decided", {
      scheduler: {
        name: this.name,
        skew: this.skew,
        uuid: this.myUUID,
      },
    })
  }

  /**
   * starts the election process and blocks until the skew as passed and we entered the proccess
   */
  public async start(): Promise<void> {
    const cacheKey = `scheduler:master-uuid:${this.name}`
    const scheduler = {
      name: this.name,
      skew: this.skew,
      uuid: this.myUUID,
    }

    return new Promise((resolve) => {
      // wait after the skew before we begin
      setTimeout(() => {
        this.timer = setInterval(async () => {
          try {
            const currentMaster = await this.redis.get(cacheKey)

            // there is a master and it is not us
            if (currentMaster && currentMaster !== this.myUUID) {
              this.isMaster = false
              return
            }

            // there is no master
            if (!currentMaster) {
              logger.info("MasterElector: taking over as new master", {
                oldMaster: currentMaster,
                scheduler,
              })

              // taking over as master
              this.isMaster = true

              // notify others
              this.emit("promoted")
            }

            // keep our master UUID fresh
            if (this.isMaster) {
              await this.redis.setex(cacheKey, 5, this.myUUID)
            }
          } catch (error) {
            logger.error("MasterElector: error while executing heartbeat cycle", {
              scheduler,
              stack: error.stack,
            })
          }
        }, 1000)

        resolve()
        this.emit("started")
      }, this.skew)
    })
  }

  public stop(): void {
    clearInterval(this.timer)

    logger.info("MasterElector: withdrawn from master election process", {
      scheduler: {
        name: this.name,
        skew: this.skew,
        uuid: this.myUUID,
      },
    })

    this.emit("stopped")
  }
}
