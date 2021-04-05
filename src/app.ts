import express, { NextFunction, Request, Response, RequestHandler } from "express"
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
    this.initializeNotFoundHandler()
  }

  public getApp(): express.Application {
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

  private initializeNotFoundHandler() {
    this.app.all("*", (req, res, next) => {
      next(new BaseException("Not Found!", 404))
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.app.use((error: BaseException, request: Request, response: Response, next: NextFunction) => {
      let status
      let message
      let stack

      if (process.env.NODE_ENV === "development") {
        status = error.status
        message = error.message
        stack = error.stack
      } else {
        status = error.status < 500 ? error.status : 500
        message = error.status < 500 ? error.message : "Something went wrong!"
      }

      return response.status(status).json({
        message,
        status,
        stack,
      })
    })
  }
}
