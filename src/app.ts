import express, { NextFunction, Request, Response } from "express"
import compression from "compression"
import helmet from "helmet"
import cors from "cors"
import http from "http"
import { AddressInfo } from "net"

import Env from "./utils/Env"
import Route from "./interfaces/route.interface"
import logger from "./utils/logger"
import BaseException from "./exceptions/BaseException"

export default class App {
  public app: express.Application
  public serverAddress: string
  public port: string | number
  public env: string

  constructor(routes: Route[]) {
    this.app = express()
    this.port = Env.get("PORT", 3000)
    this.serverAddress = Env.get("SERVER_ADDRESS")
    this.env = Env.get("NODE_ENV")

    this.initializeMiddlewares()
    this.initializeRoutes(routes)
  }

  public getApp() {
    return this.app
  }

  private initializeMiddlewares() {
    // security
    this.app.use(helmet())

    if (this.env === "production") {
      // production middlewares
      this.app.use(cors({ origin: process.env.HOST_DOMAIN, credentials: true }))
    } else if (this.env === "development") {
      // development middlewares
      this.app.use(cors({ origin: true, credentials: true }))
    }

    this.app.use(compression())

    // parsers
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
  }

  private initializeRoutes(routes: Route[]) {
    routes.forEach((route) => {
      this.app.use("/", route.router)
    })
  }

  public async start(): Promise<http.Server> {
    this.addErrorMiddleware()

    const server = this.app.listen(+this.port, this.serverAddress, () => {
      const address: AddressInfo = server.address() as AddressInfo

      logger.info("Server running", {
        address: address.address,
        port: address.port,
        url: `http://${this.serverAddress}:${address.port}`,
      })
    })

    return server
  }

  protected addErrorMiddleware(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.app.use((err: any, req: Request, res: Response) => {
      logger.error(err)
      return res.status(err instanceof BaseException ? err.status : 500).json({
        code: err instanceof BaseException ? err.code : "UNKNOWN_ERROR",
        message: err.message || "Unknown Error",
      })
    })
  }
}
