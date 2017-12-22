module.exports = {
  initializing: function () {
    nextBtn().disabled = true
    prevBtn().disabled = true
    openBtn().disabled = true
    widget().src = ''
  },

  show: function (playlistId, playlistNumber) {
    widget().src = 'https://widget.kkbox.com/v1/?' +
                   'id=' + playlistId + '&' +
                   'type=playlist' + '&' +
                   'lang=en'
    if (playlistNumber >= 1) {
      prevBtn().disabled = false
    } else {
      prevBtn().disabled = true
    }
    nextBtn().disabled = false
    openBtn().disabled = false
  },

  next: function () {
    nextBtn().disabled = true
    prevBtn().disabled = true
    openBtn().disabled = true
  },

  prev: function () {
    nextBtn().disabled = true
    prevBtn().disabled = true
    openBtn().disabled = true
  }
}

function nextBtn () {
  return document.querySelector('button.playlist.next')
}

function prevBtn () {
  return document.querySelector('button.playlist.prev')
}

function openBtn () {
  return document.querySelector('button.playlist.open')
}

function widget () {
  return document.getElementById('kkbox-widget')
}
