class BaseException extends Error {
  public status: number
  public message: string
  constructor(message: string, status?: number) {
    super(message)
    this.status = status || 500
    this.message = message
  }
}

export default BaseException
