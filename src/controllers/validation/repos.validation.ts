import * as Joi from "joi"
import { ContainerTypes, ValidatedRequestSchema, createValidator } from "express-joi-validation"
import { created_ago } from "../../services/github.service"

export const validator = createValidator()

export const qetReposQuerySchema = Joi.object({
  created: Joi.string().valid(...Object.values(created_ago)),
  language: Joi.string(),
  limit: Joi.number().valid(10, 50, 100),
})

export interface GetReposRequestSchema extends ValidatedRequestSchema {
  [ContainerTypes.Query]: {
    created: string
    language: string
    limit: number
  }
}
