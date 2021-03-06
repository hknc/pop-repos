import { NextFunction, Request, Response } from "express"

export default class IndexController {
  public getIndex = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({ message: "healthy", status: 200 })
    } catch (error) {
      next(error)
    }
  }
}
