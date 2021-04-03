import App from "./app"
import IndexRoute from "./routes/index.route"
import ReposRoute from "./routes/repos.route"
import Redis from "./utils/RedisClient"

const app = new App([new IndexRoute(), new ReposRoute()])

Redis.init()

app.start()
