/* Utility functions */
var axios = require('axios')

module.exports.zfill = zfill
module.exports.searchWorkoutPlaylist = searchWorkoutPlaylist

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
