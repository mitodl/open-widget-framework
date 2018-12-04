import fetch from "node-fetch"

export function fetchJsonData(url, init) {
  /**
   * fetchJsonData is the default fetch wrapper to handle sending requests and parsing the returns into json.
   *    It expects a csrf token to by defined on the window for making non-GET requests
   *
   * inputs:
   *    url: the path to make the request to
   *    init: values to set on the request
   */
  return fetch(
    url,
    init === undefined
      ? undefined
      : {
        ...init,
        method:  init.method || "GET",
        headers: {
          ...init.headers,
          "X-CSRFToken":
              "headers" in init
                ? init.headers["X-CSRFToken"] || window.csrfToken
                : window.csrfToken,
          "Content-Type":
              "headers" in init
                ? init.headers["Content-Type"] || "application/json"
                : "application/json"
        }
      }
  ).then(data => data.json())
}
