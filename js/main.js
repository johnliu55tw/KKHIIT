// var HiitStateMachine = require('./hiit_timer.js').HiitStateMachine
var HiitTimerWidget = require('./hiit_timer_widget/fsm.js').HiitTimerWidget
var PlaylistWidget = require('./playlist_widget/fsm.js').PlaylistWidget

function main () {
  var sm = new HiitTimerWidget()

  document.getElementById('start-btn').onclick = () => sm.startBtnClicked()
  document.getElementById('setting-btn').onclick = () => sm.settingBtnClicked()
  document.getElementById('reset-btn').onclick = () => sm.resetBtnClicked()
  document.querySelectorAll('.setting input').forEach((input) => {
    input.oninput = () => sm.settingsUpdated()
    input.onblur = () => sm.settingsUpdated()
  })

  // Playlist
  var psm = new PlaylistWidget()
  document.querySelector('button.playlist.next').onclick = () => psm.next()
  document.querySelector('button.playlist.prev').onclick = () => psm.prev()

  // Open playlist in KKBOX app
  document.querySelector('button.playlist.open').onclick = () => {
    window.open('kkbox://view_and_play_playlist_' + psm.playlistId, '_self')
  }
}

document.addEventListener('DOMContentLoaded', function () { main() })
