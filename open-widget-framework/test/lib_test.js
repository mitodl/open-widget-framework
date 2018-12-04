import { expect } from "chai"
import * as fetch from "node-fetch"

import { fetchJsonData as fetchData } from "../src/lib"

describe("fetchJsonData", () => {
  const dummyUrl = "https://some/dummy.url"
  const dummyCsrf = "token"
  const dummyInit1 = {
    method: "POST",
    body:   JSON.stringify("dummyData")
  }
  const dummyInit2 = {
    method:  "POST",
    body:    JSON.stringify("dummyData"),
    headers: {
      "X-CSRFToken": dummyCsrf
    }
  }
  const expectedInit = {
    method:  "POST",
    body:    JSON.stringify("dummyData"),
    headers: {
      "X-CSRFToken":  dummyCsrf,
      "Content-Type": "application/json"
    }
  }

  const fetchStub = global.fetchStub
  afterEach(() => fetchStub.resetHistory())

  it("makes a GET request when no init is given", done => {
    fetchStub.resolves(new fetch.Response(JSON.stringify("dummyData")))

    fetchData(dummyUrl).then(() => {
      expect(fetchStub.withArgs(dummyUrl).callCount).to.equal(1)
      done()
    })
  })

  it("makes an appropriate request when an init is given and window.csrfToken is defined", done => {
    window.csrfToken = dummyCsrf

    fetchStub.resolves(new fetch.Response(JSON.stringify("dummyData")))
    fetchData(dummyUrl, dummyInit1).then(() => {
      expect(fetchStub.firstCall.args).to.deep.equal([dummyUrl, expectedInit])
      done()
    })
  })

  it("uses the defined csrf token if it is given in headers", done => {
    window.csrfToken = undefined

    fetchStub.resolves(new fetch.Response(JSON.stringify("dummyData")))
    fetchData(dummyUrl, dummyInit2).then(() => {
      expect(fetchStub.firstCall.args).to.deep.equal([dummyUrl, expectedInit])
      done()
    })
  })
})
