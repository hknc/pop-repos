import request from "supertest"
import App from "../app"
import IndexRoute from "./index.route"

describe("testing main", () => {
  describe("[GET] /", () => {
    it("response statusCode 200", async (done) => {
      const indexRoute = new IndexRoute()
      const app = new App([indexRoute])

      await request(app.getApp())
        .get(indexRoute.path)
        .expect(200)
        .expect("Content-Type", /application\/json/)

      done()
    })
  })
})
