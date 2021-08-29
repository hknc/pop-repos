import * as IndexRoute from "./IndexRoute"
// @ponicode
describe("initializeRoutes", () => {
    let inst: any

    beforeEach(() => {
        inst = new IndexRoute.default()
    })

    test("0", () => {
        let callFunction: any = () => {
            inst.initializeRoutes()
        }
    
        expect(callFunction).not.toThrow()
    })
})
