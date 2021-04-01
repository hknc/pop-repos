import { cleanEnv, port, str, host } from "envalid"

const validateEnvs = () => {
  cleanEnv(process.env, {
    NODE_ENV: str(),
    PORT: port(),
    HOST_DOMAIN: host(),
  })
}

export default validateEnvs
