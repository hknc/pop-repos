import dotenv from "dotenv"
import App from "./app"
import IndexRoute from "./routes/index.route"
import validateEnvs from "./utils/validateEnvs"

// load .env
dotenv.config()
// validate env variables
validateEnvs()

const app = new App([new IndexRoute()])

app.start()
