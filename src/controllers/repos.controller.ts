import { NextFunction, Request, Response } from "express"
import GitHubService from "../services/github.service"

class ReposController {
  public getRepos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const repos = await GitHubService.getRepos()
      res.json({ ...repos })
    } catch (error) {
      next(error)
    }
  }
}

export default ReposController
