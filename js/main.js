var axios = require('axios')
var HiitStateMachine = require('./hiit_timer.js').HiitStateMachine
var searchWorkoutPlaylist = require('./utils.js').searchWorkoutPlaylist

function PlaylistView () {
  this.nextBtn = document.querySelector('button.playlist.next')
  this.prevBtn = document.querySelector('button.playlist.prev')
  this.openBtn = document.querySelector('button.playlist.open')
  this.widget = document.getElementById('kkbox-widget')
}
PlaylistView.prototype.initializing = function () {
  this.nextBtn.disabled = true
  this.prevBtn.disabled = true
  this.openBtn.disabled = true
  this.widget.src = ''
}
PlaylistView.prototype.show = function (playlistId, playlistNumber) {
  this.widget.src = 'https://widget.kkbox.com/v1/?' +
                    'id=' + playlistId + '&' +
                    'type=playlist' + '&' +
                    'lang=en'
  if (playlistNumber >= 1) {
    this.prevBtn.disabled = false
  } else {
    this.prevBtn.disabled = true
  }
  this.nextBtn.disabled = false
  this.openBtn.disabled = false
}
PlaylistView.prototype.next = function () {
  this.nextBtn.disabled = true
  this.prevBtn.disabled = true
  this.openBtn.disabled = true
}
PlaylistView.prototype.prev = function () {
  this.nextBtn.disabled = true
  this.prevBtn.disabled = true
  this.openBtn.disabled = true
}

function main () {
  var sm = new HiitStateMachine()

  document.getElementById('start-btn').onclick = function () { sm.startBtnClicked() }
  document.getElementById('setting-btn').onclick = function () { sm.settingBtnClicked() }
  document.getElementById('reset-btn').onclick = function () { sm.resetBtnClicked() }
  document.querySelectorAll('.setting input').forEach(function (input) {
    input.oninput = function () { sm.settingsUpdated() }
    input.onblur = function () { sm.settingsUpdated() }
  })

  // Playlist
  var playlistView = new PlaylistView()
  var nextBtn = document.querySelector('button.playlist.next')
  var prevBtn = document.querySelector('button.playlist.prev')
  var openBtn = document.querySelector('button.playlist.open')
  var accessToken = null
  var currPlaylistNumber = 0
  var currPlaylistId = null

  // Initializing
  playlistView.initializing()
  axios.get('/token')
    .then(function (resp) {
      if ('error' in resp.data) {
        // Response object contains key 'error' means error occurred.
        throw new Error(resp.data.error)
      }
      console.debug('Retrieved access token: ' + resp.data.access_token)
      nextBtn.disabled = false
      openBtn.disabled = false
      accessToken = resp.data.access_token // Global token
      return accessToken
    })
    .catch(function (error) {
      console.error('Failed to requesting for access token: ' + error)
      throw new Error('Failed to request for access token')
    })
    .then(function (token) {
      // Use the token to search for playlists.
      // Function searchWorkoutPlaylist returns a Promise,
      // so it can be returned here.
      return searchWorkoutPlaylist(token, 0)
    })
    .then(function (playlistId) {
      currPlaylistId = playlistId
      playlistView.show(currPlaylistId, currPlaylistNumber)
    })
    .catch(function (error) {
      console.error('Failed to initialize the playlist view: ' + error)
    })
  // Fetching the next playlist
  nextBtn.onclick = function () {
    playlistView.next()
    currPlaylistNumber += 1
    searchWorkoutPlaylist(accessToken, currPlaylistNumber)
    .then(function (playlistId) {
      currPlaylistId = playlistId
      playlistView.show(currPlaylistId, currPlaylistNumber)
    })
    .catch(function (error) {
      console.error('Failed to update the playlist: ' + error)
    })
  }
  // Fetching the previous playlist
  prevBtn.onclick = function () {
    playlistView.next()
    currPlaylistNumber -= 1
    searchWorkoutPlaylist(accessToken, currPlaylistNumber)
    .then(function (playlistId) {
      currPlaylistId = playlistId
      playlistView.show(currPlaylistId, currPlaylistNumber)
    })
    .catch(function (error) {
      console.error('Failed to update the playlist: ' + error)
    })
  }
  // Open the playlist using kkbox:// protocol
  openBtn.onclick = function () {
    window.open('kkbox://view_and_play_playlist_' + currPlaylistId, '_self')
  }
}

document.addEventListener('DOMContentLoaded', function () { main() })
