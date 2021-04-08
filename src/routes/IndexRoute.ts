import { Router } from "express"
import Route from "../interfaces/route.interface"
import IndexController from "../controllers/IndexController"

class IndexRoute implements Route {
  public path = "/"
  public router = Router()
  public indexController = new IndexController()

  constructor() {
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.indexController.getIndex)
  }
}

export default IndexRoute
