import { Router } from "express"
import { qetReposQuerySchema, validator } from "../controllers/validation/repos.validation"
import ReposController from "../controllers/repos.controller"
import Route from "../interfaces/route.interface"

class ReposRoute implements Route {
  public path = "/repos"
  public router = Router()
  public reposController = new ReposController()

  constructor() {
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, validator.query(qetReposQuerySchema), this.reposController.getRepos)
  }
}

export default ReposRoute
