import request from "supertest"
import nock from "nock"
import App from "../app"
import ReposRoute from "../routes/repos.route"
import Redis from "../utils/RedisClient"
import reposPublicMock from "./__mocks__/reposPublic.mock"
import reposMock from "./__mocks__/repos.mock"
import { created_ago } from "../services/github.service"

jest.mock("ioredis")

Redis.init()

describe("testing repos", () => {
  afterEach((done) => {
    nock.cleanAll()
    done()
  })

  describe("[GET] /repos", () => {
    test("response with cache by default", async () => {
      const reposRoute = new ReposRoute()
      const app = new App([reposRoute])

      jest.spyOn(Redis.redis, "get").mockReturnValue(Promise.resolve(JSON.stringify(reposPublicMock)))

      const response = await request(app.getApp())
        .get(reposRoute.path)
        .expect(200)
        .expect("Content-Type", /application\/json/)
      expect(response.body).toEqual(reposPublicMock)
    })

    test("make api call if cache is missing", async () => {
      const reposRoute = new ReposRoute()
      const app = new App([reposRoute])

      jest.spyOn(Redis.redis, "get").mockReturnValue(Promise.resolve(null))

      const scope = nock(process.env.GITHUB_BASE_URL as string)
        .get("/repositories")
        .query({ q: "stars:>=1", sort: "stars", order: "desc", per_page: 100, page: 1 })
        .reply(200, reposMock)

      const response = await request(app.getApp())
        .get(reposRoute.path)
        .expect(200)
        .expect("Content-Type", /application\/json/)

      expect(response.body).toHaveProperty("last_updated")
      expect(response.body).toHaveProperty("repos")

      scope.done()
    })

    test("response according to `created` query param", async () => {
      const reposRoute = new ReposRoute()
      const app = new App([reposRoute])

      jest.spyOn(Redis.redis, "get").mockReturnValue(Promise.resolve(JSON.stringify(reposPublicMock)))

      const response = await request(app.getApp())
        .get(reposRoute.path)
        .query({ created: created_ago.DAY })
        .expect(200)
        .expect("Content-Type", /application\/json/)

      expect(response.body).toHaveProperty("last_updated")
      expect(response.body).toHaveProperty("repos")
    })

    test("response according to `limit` query param", async () => {
      const reposRoute = new ReposRoute()
      const app = new App([reposRoute])

      jest.spyOn(Redis.redis, "get").mockReturnValue(Promise.resolve(JSON.stringify(reposPublicMock)))

      const response = await request(app.getApp())
        .get(reposRoute.path)
        .query({ limit: 10 })
        .expect(200)
        .expect("Content-Type", /application\/json/)

      expect(response.body).toHaveProperty("last_updated")
      expect(response.body).toHaveProperty("repos")
      expect(response.body.repos.length).toBe(10)
    })
  })
})
