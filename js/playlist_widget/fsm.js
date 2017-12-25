var StateMachine = require('javascript-state-machine')
var searchWorkoutPlaylist = require('../utils.js').searchWorkoutPlaylist
var fetchAccessToken = require('../utils.js').fetchAccessToken
var playlistView = require('./view.js')

module.exports.PlaylistWidget = StateMachine.factory({

  init: 'initializing',

  transitions: [
    { name: 'ready', from: 'initializing', to: 'show' },
    { name: 'next', from: 'show', to: 'fetchNextPlaylist' },
    { name: 'prev', from: 'show', to: 'fetchPrevPlaylist' },
    { name: 'loaded', from: ['fetchNextPlaylist', 'fetchPrevPlaylist'], to: 'show' }
  ],

  data: {
    accessToken: null,
    playlistId: null,
    playlistNum: 0,
    view: playlistView
  },

  methods: {
    onEnterInitializing: function () {
      console.log('Enter Initializing')
      this.view.initializing()
      return fetchAccessToken()
        .then((token) => {
          // Use the token to search for playlists.
          // Function searchWorkoutPlaylist returns a Promise,
          // so it can be returned here.
          this.accessToken = token
          return searchWorkoutPlaylist(token, 0)
        })
        .then((playlistId) => {
          this.playlistId = playlistId
          setTimeout(() => { this.ready() }, 0)
        })
        .catch((error) => {
          console.error('Failed to initialize the playlist view: ' + error)
        })
    },
    onEnterShow: function () {
      console.log('Enter Show')
      this.view.show(this.playlistId, this.playlistNum)
    },
    onEnterFetchNextPlaylist: function () {
      this.view.next()
      this.playlistNum += 1
      return searchWorkoutPlaylist(this.accessToken, this.playlistNum)
        .then((playlistId) => {
          this.playlistId = playlistId
          setTimeout(() => this.loaded(), 0)
        })
        .catch((error) => {
          console.error('Failed to update the playlist: ' + error)
        })
    },
    onEnterFetchPrevPlaylist: function () {
      this.view.prev()
      this.playlistNum -= 1
      return searchWorkoutPlaylist(this.accessToken, this.playlistNum)
        .then((playlistId) => {
          this.playlistId = playlistId
          setTimeout(() => this.loaded(), 0)
        })
        .catch((error) => {
          console.error('Failed to update the playlist: ' + error)
        })
    }
  }
})
