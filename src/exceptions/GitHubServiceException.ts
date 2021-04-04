import BaseException from "./BaseException"

export default class GitHubServiceException extends BaseException {
  constructor(message: string) {
    super(`GitHub service exception: ${message}`)
  }
}
