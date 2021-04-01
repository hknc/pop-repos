import express from "express"
import cors from "cors"
import http from "http"
import { AddressInfo } from "net"

import Route from "./interfaces/route.interface"

class App {
  public app: express.Application
  public serverAddress: string
  public port: string | number
  public env: string

  constructor(routes: Route[]) {
    this.app = express()
    this.port = process.env.PORT || 3000
    this.serverAddress = process.env.SERVER_ADDRESS || ""
    this.env = process.env.NODE_ENV || "development"

    this.initializeMiddlewares()
    this.initializeRoutes(routes)
  }

  private initializeMiddlewares() {
    if (this.env === "production") {
      // production middlewares
      this.app.use(cors({ origin: process.env.HOST_DOMAIN, credentials: true }))
    } else if (this.env === "development") {
      // development middlewares
      this.app.use(cors({ origin: true, credentials: true }))
    }

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
    const server = this.app.listen(+this.port, this.serverAddress, () => {
      const address: AddressInfo = server.address() as AddressInfo

      console.info("Server running", {
        address: address.address,
        port: address.port,
        url: `http://${this.serverAddress}:${address.port}`,
      })
    })

    return server
  }
}

export default App
