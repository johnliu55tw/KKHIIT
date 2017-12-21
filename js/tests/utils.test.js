/* eslint-env jest */

jest.mock('axios')

var zfill = require('../utils.js').zfill
var searchWorkoutPlaylist = require('../utils.js').searchWorkoutPlaylist

describe('zfill', () => {
  describe('should correctly transform', () => {
    test("1 to '01'", () => {
      expect(zfill(1)).toBe('01')
    })

    test("33 to '33'", () => {
      expect(zfill(33)).toBe('33')
    })

    test("444 to '444'", () => {
      expect(zfill(444)).toBe('444')
    })
  })

  describe('should detect error', () => {
    test("'abcde' should return NaN", () => {
      expect(zfill('abcde')).toBe(NaN)
    })
  })
})

describe('searchWorkoutPlaylist', () => {
  test('should correctly called axios', () => {
    searchWorkoutPlaylist('theFakeToken', 123)

    var mockedAxios = require.requireMock('axios')
    expect(mockedAxios.get.mock.calls[0][0]).toBe('https://api.kkbox.com/v1.1/search')
    expect(mockedAxios.get.mock.calls[0][1]).toEqual({
      headers: {
        Authorization: 'Bearer ' + 'theFakeToken'
      },
      params: {
        limit: 1,
        offset: 123,
        q: 'workout',
        territory: 'TW',
        type: 'playlist'
      }
    })
  })

  test('will return playlist ID if no error occurred', () => {
    // Mocking the axios.get response to Open API playlist response
    // see ../../__mocks__/axios.js
    var mockedAxios = require.requireMock('axios')
    mockedAxios.__setResponseJson({
      playlists: {
        data: [
          {
            id: 'aFakePlaylistId' // A fake playlist ID
          }
        ]
      }
    })
    return searchWorkoutPlaylist('theFakeToken', 123).then(data => {
      expect(data).toBe('aFakePlaylistId')
    })
  })
})
