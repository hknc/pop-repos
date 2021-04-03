import request from "supertest"
import nock from "nock"
import App from "../app"
import ReposRoute from "../routes/repos.route"
import reposMock from "../mocks/repos.mock"

describe("testing repos", () => {
  afterEach(() => {
    nock.restore()
  })

  describe("[GET] /repos", () => {
    it("response statusCode 200", async () => {
      const reposRoute = new ReposRoute()
      const app = new App([reposRoute])

      const scope = nock(process.env.GITHUB_BASE_URL as string)
        .get("/repositories")
        .query({ q: "created:>2019-01-10", sort: "stars", order: "desc" })
        .reply(200, { ...reposMock })

      const response = await request(app.getApp())
        .get(reposRoute.path)
        .expect(200)
        .expect("Content-Type", /application\/json/)
      expect(response.body).toEqual({ ...reposMock })
      scope.done()
    })
  })
})
