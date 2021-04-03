import dotenv from "dotenv"
import path from "path"
import validateEnvs from "../utils/validateEnvs"
import MissingEnvvarException from "../exception/MissingEnvvarException"

// load .env
dotenv.config({ path: path.resolve(__dirname, "../.env") })
// validate env variables
validateEnvs()

export default class Env {
  public static has(envvar: string) {
    return process.env[envvar] !== undefined
  }

  public static get<T>(envvar: string, defaultValue?: T): T {
    const val = process.env[envvar]

    if (val === undefined) {
      if (defaultValue !== undefined) {
        return defaultValue
      }

      throw new MissingEnvvarException(envvar)
    }

    return (val as unknown) as T
  }
}
