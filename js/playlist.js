var axios = require('axios')
var searchWorkoutPlaylist = require('./utils.js').searchWorkoutPlaylist

module.exports.PlaylistStateMachine = PlaylistStateMachine

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

function PlaylistStateMachine () {
  this.view = new PlaylistView()
  this.accessToken = null
  this.playlistId = null
  this.playlistNum = 0
  this.state = this.Initializing
  this.Initializing()
}
// States
PlaylistStateMachine.prototype.Initializing = function () {
  console.debug('Entering state initializing')
  this.view.initializing()
  axios.get('/token')
    .then((resp) => {
      if ('error' in resp.data) {
        // Response object contains key 'error' means error occurred.
        throw new Error(resp.data.error)
      } else {
        console.debug('Retrieved access token: ' + resp.data.access_token)
        this.accessToken = resp.data.access_token // Global token
        return this.accessToken
      }
    })
    .catch((error) => {
      console.error('Failed to requesting for access token: ' + error)
      throw new Error('Failed to request for access token')
    })
    .then((token) => {
      // Use the token to search for playlists.
      // Function searchWorkoutPlaylist returns a Promise,
      // so it can be returned here.
      return searchWorkoutPlaylist(token, 0)
    })
    .then((playlistId) => {
      this.playlistId = playlistId
      this.ready()
    })
    .catch((error) => {
      console.error('Failed to initialize the playlist view: ' + error)
    })
}
PlaylistStateMachine.prototype.Show = function () {
  console.debug('Entering state show')
  this.view.show(this.playlistId, this.playlistNum)
}
PlaylistStateMachine.prototype.Next = function () {
  console.debug('Entering state next')
  this.view.next()
  this.playlistNum += 1
  searchWorkoutPlaylist(this.accessToken, this.playlistNum)
  .then((playlistId) => {
    this.playlistId = playlistId
    this.loaded()
  })
  .catch((error) => {
    console.error('Failed to update the playlist: ' + error)
  })
}
PlaylistStateMachine.prototype.Prev = function () {
  console.debug('Entering state prev')
  this.view.prev()
  this.playlistNum -= 1
  searchWorkoutPlaylist(this.accessToken, this.playlistNum)
  .then((playlistId) => {
    this.playlistId = playlistId
    this.loaded()
  })
  .catch((error) => {
    console.error('Failed to update the playlist: ' + error)
  })
}
PlaylistStateMachine.prototype.Open = function () {
  console.debug('Entering state open')
  window.open('kkbox://view_and_play_playlist_' + this.playlistId, '_self')
  this.opened()
}
// Events
PlaylistStateMachine.prototype.ready = function () {
  if (this.state === this.Initializing) {
    this.state = this.Show
  } else {
    console.error('Invalid state for ready event: ' + this.state)
  }
  this.state()
}
PlaylistStateMachine.prototype.next = function () {
  if (this.state === this.Show) {
    this.state = this.Next
  } else {
    console.error('Invalid state for next event: ' + this.state)
  }
  this.state()
}
PlaylistStateMachine.prototype.prev = function () {
  if (this.state === this.Show) {
    this.state = this.Prev
  } else {
    console.error('Invalid state for prev event: ' + this.state)
  }
  this.state()
}
PlaylistStateMachine.prototype.loaded = function () {
  if (this.state === this.Next || this.state === this.Prev) {
    this.state = this.Show
  } else {
    console.error('Invalid state for loaded event: ' + this.state)
  }
  this.state()
}
PlaylistStateMachine.prototype.open = function () {
  if (this.state === this.Show) {
    this.state = this.Open
  } else {
    console.error('Invalid state for open event: ' + this.state)
  }
  this.state()
}
PlaylistStateMachine.prototype.opened = function () {
  if (this.state === this.Open) {
    this.state = this.Show
  } else {
    console.error('Invalid state for opened event: ' + this.state)
  }
  this.state()
}
