import App from "./app"
import CronService from "./cron/CronService"
import IndexRoute from "./routes/index.route"
import ReposRoute from "./routes/repos.route"
import MasterElector from "./utils/MasterElector"
import Redis from "./utils/RedisClient"

const app = new App([new IndexRoute(), new ReposRoute()])
export const masterElector = new MasterElector("repos-app")

Redis.init()

masterElector.start()

CronService.init()

app.start()
