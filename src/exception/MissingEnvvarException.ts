import BaseException from "../exception/BaseException"

export default class MissingEnvvarException extends BaseException {
  constructor(envvar: string) {
    super(`Missing environment variable: ${envvar}`)
  }
}
