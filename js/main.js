var HiitStateMachine = require('./hiit_timer.js').HiitStateMachine
var PlaylistStateMachine = require('./playlist_widget/fsm.js').PlaylistStateMachine

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
  var psm = new PlaylistStateMachine()
  document.querySelector('button.playlist.next').onclick = () => psm.next()
  document.querySelector('button.playlist.prev').onclick = () => psm.prev()

  // Open playlist in KKBOX app
  document.querySelector('button.playlist.open').onclick = () => {
    window.open('kkbox://view_and_play_playlist_' + psm.playlistId, '_self')
  }
}

document.addEventListener('DOMContentLoaded', function () { main() })
