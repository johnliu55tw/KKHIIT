/* eslint-env jest */

// Manual mock of the axios module

const axios = jest.genMockFromModule('axios')

let responseObj = {
  data: {}
}

function __setResponseJson (obj) {
  responseObj.data = Object.assign({}, obj)
}

const mockGet = jest.fn()
mockGet.mockReturnValue(new Promise((resolve, reject) => {
  return resolve(responseObj)
}))

axios.__setResponseJson = __setResponseJson
axios.get = mockGet

module.exports = axios
