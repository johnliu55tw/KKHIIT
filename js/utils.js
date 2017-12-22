/* Utility functions */
var axios = require('axios')

module.exports.zfill = zfill
module.exports.searchWorkoutPlaylist = searchWorkoutPlaylist
module.exports.fetchAccessToken = fetchAccessToken

function zfill (val) {
  /* Padding one zero on the left to reach length 2. */
  if (typeof val !== 'number') {
    return NaN
  }
  if (Math.floor(val / 10) >= 1) {
    return val.toString()
  } else {
    return '0' + val.toString()
  }
}

function searchWorkoutPlaylist (token, offset) {
  /* Search for playlists using keyword 'workout'
   *
   * Return:
   *   Response Promise
   * Throws:
   *   Request failed.
   */
  // console.debug("Searching 'workout' playlist with offset " + offset)
  return axios.get('https://api.kkbox.com/v1.1/search',
    {
      headers: {
        Authorization: 'Bearer ' + token
      },
      params: {
        limit: 1,
        offset: offset,
        q: 'workout',
        territory: 'TW',
        type: 'playlist'
      }
    })
    .then(function (resp) {
      var playlistId = resp.data.playlists.data[0].id
      // console.debug('Found playlist ID: ' + playlistId)
      return playlistId
    })
}

function fetchAccessToken () {
  /* Get the access token from our server's /token endpoint.
   *
   * Return:
   *   Promise with access token if resolved or reason if failed.
   */
  return axios.get('/token')
          .then((resp) => {
            if ('error' in resp.data) {
              // Response object contains key 'error' means error occurred.
              throw new Error(resp.data.error)
            } else {
              // console.debug('Retrieved access token: ' + resp.data.access_token)
              this.accessToken = resp.data.access_token // Global token
              return this.accessToken
            }
          })
          .catch((error) => {
            console.error('Failed to requesting for access token: ' + error)
            throw new Error('Failed to request for access token')
          })
}
