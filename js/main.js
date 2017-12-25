// var HiitStateMachine = require('./hiit_timer.js').HiitStateMachine
var HiitTimerWidget = require('./hiit_timer_widget/fsm.js').HiitTimerWidget
var PlaylistWidget = require('./playlist_widget/fsm.js').PlaylistWidget

function main () {
  var sm = new HiitTimerWidget()

  document.getElementById('start-btn').onclick = () => {
    if (sm.state === 'initialized') {
      // Appending 'autoplay=true' query parameter to src of the widget, for
      // auto-playing the music while the user click the start button.
      var widget = document.getElementById('kkbox-widget')
      widget.src = widget.src + '&autoplay=true'
    }
    sm.startBtnClicked()
  }
  document.getElementById('setting-btn').onclick = () => sm.settingBtnClicked()
  document.getElementById('reset-btn').onclick = () => {
    // Removing the 'autoplay' query parameter
    var widget = document.getElementById('kkbox-widget')
    var foundIdx = widget.src.indexOf('&autoplay')
    if (foundIdx >= 0) {
      widget.src = widget.src.substr(0, widget.src.indexOf('&autoplay'))
    }

    sm.resetBtnClicked()
  }
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
