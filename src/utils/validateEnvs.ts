import { cleanEnv, port, str, host, num } from "envalid"

const validateEnvs = () => {
  cleanEnv(process.env, {
    NODE_ENV: str(),
    PORT: port(),
    HOST_DOMAIN: host(),
    GITHUB_BASE_URL: str(),
    REDIS_HOST: str(),
    REDIS_PORT: num({ default: 6379 }),
    REDIS_DB: num({ default: 0 }),
  })
}

export default validateEnvs
