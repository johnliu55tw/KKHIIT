/* Constants */

const axios = window.axios // Prevent linter from complaning about 'axios'
var MAX_SETS = 99
var MIN_SETS = 1
var MAX_MINS = 59
var MAX_SECS = 59

/* Utility functions */

function zfill (val) {
  /* Padding one zero on the left to reach length 2. */
  if (Math.floor(val / 10) >= 1) {
    return val.toString()
  } else {
    return '0' + val.toString()
  }
}

function searchWorkoutPlaylist (token, offset) {
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
      console.log(playlistId)
      return playlistId
    })
    .catch(function (error) {
      console.error('Error on searching playlist: ' + error)
      throw new Error(error)
    })
}

/* Objects */

function HiitTimerSetting (warmupSecs, highSecs, lowSecs, cooldownSecs, totalSets) {
  /* Constructor
   *
   * For *Secs arguments, they take either a string representation of "MM:SS",
   * or a number in seconds.
   *
   */
  var allPassed = true
  var verifyResult = {
    warmup: true,
    high: true,
    low: true,
    cooldown: true,
    totalSets: true
  }

  try {
    HiitTimerSetting.parseTime(warmupSecs)
    this.warmupSecs = HiitTimerSetting.parseTime(warmupSecs)
  } catch (e) {
    verifyResult.warmup = false
    allPassed = false
  }

  try {
    HiitTimerSetting.parseTime(highSecs)
    this.highSecs = HiitTimerSetting.parseTime(highSecs)
  } catch (e) {
    verifyResult.high = false
    allPassed = false
  }

  try {
    HiitTimerSetting.parseTime(lowSecs)
    this.lowSecs = HiitTimerSetting.parseTime(lowSecs)
  } catch (e) {
    verifyResult.low = false
    allPassed = false
  }

  try {
    HiitTimerSetting.parseTime(cooldownSecs)
    this.cooldownSecs = HiitTimerSetting.parseTime(cooldownSecs)
  } catch (e) {
    verifyResult.cooldown = false
    allPassed = false
  }

  var parsedSets = parseInt(totalSets)
  if (parsedSets === null || parsedSets > MAX_SETS || parsedSets < MIN_SETS) {
    verifyResult.totalSets = false
    allPassed = false
  } else {
    this.totalSets = parsedSets
  }

  if (!allPassed) {
    throw verifyResult
  }
}
HiitTimerSetting.parseTime = function (strOrNumber) {
  /* STATIC METHOD
   *
   * Parse a string "MM:SS" into seconds. If it's number, check the value and
   * returns it directly.
   *
   * Return:
   *   Integer: Parsed time in seconds.
   *
   * Throws:
   *   - Invalid format
   *   - Minutes or seconds value exceed maximum (59)
   */
  if (typeof strOrNumber === 'string') {
    var tStr = strOrNumber
    var timeRe = /^[0-9]{1,2}:[0-9]{1,2}$/
    if (!timeRe.test(tStr)) {
      throw new Error('Invalid format.')
    } else {
      var mins = parseInt(tStr.split(':')[0])
      var secs = parseInt(tStr.split(':')[1])
      if (mins > MAX_MINS) {
        throw new Error('Minutes value exceed maximum value 59.')
      } else if (secs > MAX_SECS) {
        throw new Error('seconds value exceed maximum value 59.')
      } else {
        return mins * 60 + secs
      }
    }
  } else if (typeof strOrNumber === 'number') {
    var number = strOrNumber
    if (number <= (MAX_MINS * 60 + MAX_SECS)) {
      return number
    } else {
      throw new Error('Total seconds ' +
                      number.toString() +
                      ' exceed maximum ' +
                      (MAX_MINS * 60 + MAX_SECS))
    }
  }
}

function HiitTimer (hiitSetting, onIntervalChange, onCounterChange, onDoneSetsChange) {
  /* Constructor
   *
   * Takes a HiitTimerSetting and three callback functions for state changes as arguments.
   *
   */
  /* Setting up initial state */
  this.hiitSetting = Object.assign({}, hiitSetting)
  this.currentState = HiitTimer.IntervalState.WARMUP
  // The countdown counter in seconds.
  this.counter = this.hiitSetting.warmupSecs
  // Counter for counting sets
  // Whenever a high interval is finished, it will be increased by 1
  this.doneSets = 0

  /* State changed handlers */
  if (typeof onIntervalChange === 'function') {
    this.onIntervalChange = onIntervalChange
  } else {
    this.onIntervalChange = null
  }
  if (typeof onCounterChange === 'function') {
    this.onCounterChange = onCounterChange
  } else {
    this.onCounterChange = null
  }
  if (typeof onDoneSetsChange === 'function') {
    this.onDoneSetsChange = onDoneSetsChange
  } else {
    this.onDoneSetsChange = null
  }

  /* The tick() method will update its internal state, and will notify state
   * change handlers if state changed.
   */
  this.tick = function () {
    // Stores states before entering updating algorithm for detecting state changed
    var prevIntervalState = this.currentState
    var prevCounter = this.counter
    var prevDoneSets = this.doneSets

    this.counter -= 1
    switch (this.currentState) {
      case HiitTimer.IntervalState.WARMUP:
        if (this.counter <= 0) {
          this.counter = this.hiitSetting.highSecs
          this.currentState = HiitTimer.IntervalState.HIGH
        }
        break

      case HiitTimer.IntervalState.HIGH:
        if (this.counter <= 0) {
          this.doneSets += 1
          this.counter = this.hiitSetting.lowSecs
          this.currentState = HiitTimer.IntervalState.LOW
        }
        break

      case HiitTimer.IntervalState.LOW:
        if (this.counter <= 0) {
          if (this.doneSets === this.hiitSetting.totalSets) {
            // All sets are done! Congradulations!
            this.counter = this.hiitSetting.cooldownSecs
            if (this.hiitSetting.cooldownSecs <= 0) {
              this.currentState = HiitTimer.IntervalState.DONE
            } else {
              this.currentState = HiitTimer.IntervalState.COOLDOWN
            }
          } else {
            // ISYMFS!!
            this.counter = this.hiitSetting.highSecs
            this.currentState = HiitTimer.IntervalState.HIGH
          }
        }
        break

      case HiitTimer.IntervalState.COOLDOWN:
        if (this.counter <= 0) {
          this.counter = 0
          this.currentState = HiitTimer.IntervalState.DONE
        }
        break

      case HiitTimer.IntervalState.DONE:
        break

      default:
        console.log('Impossible to reach.')
    }
    // Calling handlers if states changed
    if (prevIntervalState !== this.currentState && this.onIntervalChange !== null) {
      this.onIntervalChange()
    }
    if (prevCounter !== this.currentState && this.onCounterChange !== null) {
      this.onCounterChange()
    }
    if (prevDoneSets !== this.doneSets && this.onDoneSetsChange !== null) {
      this.onDoneSetsChange()
    }
  }
}
HiitTimer.IntervalState = {
  WARMUP: 'warm up',
  HIGH: 'high',
  LOW: 'low',
  COOLDOWN: 'cool down',
  DONE: 'done'
}

function HiitView () {
  /* View object
   *
   * This object provides interfaces for setting up the appearance of the HIIT
   * timer.
   */

  // Diplaying elements
  // Buttons
  var settingBtn = document.getElementById('setting-btn')
  var startBtn = document.getElementById('start-btn')
  var resetBtn = document.getElementById('reset-btn')

  // Input container
  var inputContainer = document.querySelector('div.setting')

  // Input fields
  var inputField = {
    warmup: document.querySelector('.setting input.warmup'),
    high: document.querySelector('.setting input.high'),
    low: document.querySelector('.setting input.low'),
    cooldown: document.querySelector('.setting input.cooldown'),
    totalSets: document.querySelector('.setting input.sets')
  }

  // Helper functions
  function setTimerValue (secs) {
    /* Set the main countdown timer value */
    var timerValue = document.getElementById('timer-value')
    if (secs === null) {
      timerValue.textContent = '--:--'
    } else {
      var minPart = Math.floor(secs / 60)
      var secPart = secs % 60
      timerValue.textContent = zfill(minPart) + ':' + zfill(secPart)
    }
  }

  function setSetsValue (remain, total) {
    var setsValue = document.getElementById('sets-value')
    /* Set the 'finished/total' sets value */
    if (remain === null) {
      setsValue.textContent = '--/--'
    } else {
      setsValue.textContent = zfill(remain) + '/' + zfill(total)
    }
  }

  function setTimerBackground (intervalState) {
    /* Sets the background of the timer block by the HIIT interval */
    var style = document.querySelector('.timer-status').style
    switch (intervalState) {
      case HiitTimer.IntervalState.WARMUP:
        style.backgroundColor = 'yellow'
        break
      case HiitTimer.IntervalState.HIGH:
        style.backgroundColor = 'red'
        break
      case HiitTimer.IntervalState.LOW:
        style.backgroundColor = 'green'
        break
      case HiitTimer.IntervalState.COOLDOWN:
        style.backgroundColor = 'blue'
        break
      case HiitTimer.IntervalState.DONE:
        style.backgroundColor = 'yellow'
        break
      case null:
        style.backgroundColor = 'white'
        break
    }
  }

  /* Public methods for setting up view
   * TODO:
   * Maybe the arguments for each method could be unified.
   * */
  this.stateInitialized = function (timerValue, doneSets, totalSets, intervalState) {
    setTimerValue(timerValue)
    setSetsValue(doneSets, totalSets)
    setTimerBackground(intervalState)
    startBtn.textContent = 'Start'
    startBtn.disabled = false
    startBtn.style.width = '6em'
    startBtn.style.display = 'block'
    resetBtn.textContent = 'Reset'
    resetBtn.disabled = true
    resetBtn.style.width = '6em'
    resetBtn.style.display = 'block'
    settingBtn.textContent = 'Setting'
    settingBtn.disabled = false
    settingBtn.style.width = '6em'
    inputContainer.style.display = 'none'
  }

  this.stateRunning = function (timerValue, doneSets, totalSets, intervalState) {
    setTimerValue(timerValue)
    setSetsValue(doneSets, totalSets)
    setTimerBackground(intervalState)
    startBtn.textContent = 'Pause'
    startBtn.disabled = false
    resetBtn.textContent = 'Reset'
    resetBtn.disabled = true
    settingBtn.textContent = 'Setting'
    settingBtn.disabled = true
    inputContainer.style.display = 'none'
  }

  this.statePaused = function (timerValue, doneSets, totalSets, intervalState) {
    setTimerValue(timerValue)
    setSetsValue(doneSets, totalSets)
    setTimerBackground(intervalState)
    startBtn.textContent = 'Start'
    startBtn.disabled = false
    resetBtn.textContent = 'Reset'
    resetBtn.disabled = false
    settingBtn.textContent = 'Setting'
    settingBtn.disabled = true
    inputContainer.style.display = 'none'
  }

  this.stateConfigurating = function () {
    setTimerValue(null)
    setSetsValue(null)
    setTimerBackground(null)
    startBtn.textContent = 'Start'
    startBtn.disabled = true
    startBtn.style.display = 'none'
    resetBtn.textContent = 'Reset'
    resetBtn.disabled = true
    resetBtn.style.display = 'none'
    settingBtn.textContent = 'Apply'
    settingBtn.disabled = false
    settingBtn.style.width = '100%'
    inputContainer.style.display = 'flex'
    for (var key in inputField) {
      inputField[key].style.background = 'white'
    }
  }

  this.stateValidatingInputs = function (verifyResult) {
    setTimerValue(null)
    setSetsValue(null)
    setTimerBackground(null)
    startBtn.textContent = 'Start'
    startBtn.disabled = true
    resetBtn.textContent = 'Reset'
    resetBtn.disabled = true
    settingBtn.textContent = 'Apply'
    settingBtn.disabled = true
    inputContainer.style.display = 'flex'
    for (var key in verifyResult) {
      if (verifyResult[key] === true) {
        inputField[key].style.background = 'white'
      } else {
        inputField[key].style.background = 'red'
      }
    }
  }
}

function HiitStateMachine () {
  /* The state machine */
  this.hiitSetting = new HiitTimerSetting(15, 20, 40, 300, 20) // Defaults
  this.hiitTimer = null
  this.intervalTimerHandler = null
  this.view = new HiitView()
  this.currentState = this.Initialized
  this.Initialized()
}

// States
HiitStateMachine.prototype.Initialized = function () {
  console.debug('Entering state: Initialized')
  if (this.intervalTimerHandler !== null) {
    window.clearInterval(this.intervalTimerHandler)
    this.intervalTimerHandler = null
  }
  this.hiitTimer = new HiitTimer(
    this.hiitSetting,
    function () {
      // Playing beep sound whenever the interval changed.
      document.getElementById('beep-sound').play()
    })
  this.view.stateInitialized(this.hiitTimer.counter,
                             this.hiitTimer.doneSets,
                             this.hiitTimer.hiitSetting.totalSets,
                             this.hiitTimer.currentState)
}
HiitStateMachine.prototype.StartIntervalTimer = function () {
  console.debug('Entering state: StartIntervalTimer')
  // "this" is weird. The method has to be passed like this to the setInterval
  // function, or it cannot reference "this" to this state machine.
  this.intervalTimerHandler = window.setInterval(
    this.intervalTimerTicked.bind(this), 1000)
  this.intervalTimerStarted()
}
HiitStateMachine.prototype.StopIntervalTimer = function () {
  console.debug('Entering state: StopIntervalTimer')
  window.clearInterval(this.intervalTimerHandler)
  this.intervalTimerHandler = null
  this.intervalTimerStopped()
}
HiitStateMachine.prototype.Running = function () {
  this.view.stateRunning(this.hiitTimer.counter,
                         this.hiitTimer.doneSets,
                         this.hiitTimer.hiitSetting.totalSets,
                         this.hiitTimer.currentState)
}
HiitStateMachine.prototype.UpdateHiitTimer = function () {
  this.hiitTimer.tick()
  if (this.hiitTimer.currentState === HiitTimer.IntervalState.DONE) {
    this.hiitTimerFinished()
  } else {
    this.hiitTimerUpdated()
  }
}
HiitStateMachine.prototype.Paused = function () {
  this.view.statePaused(this.hiitTimer.counter,
                        this.hiitTimer.doneSets,
                        this.hiitTimer.hiitSetting.totalSets,
                        this.hiitTimer.currentState)
}
HiitStateMachine.prototype.Configurating = function () {
  console.debug('Entering state: Configurating')
  this.view.stateConfigurating()
}
HiitStateMachine.prototype.ValidatingInputs = function () {
  console.debug('Entering state: ValidatingInputs')
  try {
    // Verify all the input field if any input field has inputs
    this.hiitSetting = new HiitTimerSetting(document.querySelector('input.warmup').value,
                                document.querySelector('input.high').value,
                                document.querySelector('input.low').value,
                                document.querySelector('input.cooldown').value,
                                document.querySelector('input.sets').value)
  } catch (verifyResult) {
    console.log('Invalid settings detected')
    this.view.stateValidatingInputs(verifyResult)
    return
  }
  // All inputs are verified. Triggering settingValidated event
  this.settingsValidated()
}

// Events
HiitStateMachine.prototype.startBtnClicked = function () {
  if (this.currentState === this.Initialized || this.currentState === this.Paused) {
    this.currentState = this.StartIntervalTimer
  } else if (this.currentState === this.Running) {
    this.currentState = this.StopIntervalTimer
  } else {
    console.error('Invalid state for start btn click: ' + this.currentState)
  }
  this.currentState()
}
HiitStateMachine.prototype.settingBtnClicked = function () {
  if (this.currentState === this.Initialized) {
    this.currentState = this.Configurating
  } else if (this.currentState === this.Configurating) {
    this.currentState = this.Initialized
  } else {
    console.error('Invalid state for setting btn click: ' + this.currentState)
  }
  this.currentState()
}
HiitStateMachine.prototype.resetBtnClicked = function () {
  if (this.currentState === this.Paused) {
    this.currentState = this.Initialized
  } else {
    console.error('Invalid state for setting btn click: ' + this.currentState)
  }
  this.currentState()
}
HiitStateMachine.prototype.intervalTimerStarted = function () {
  if (this.currentState === this.StartIntervalTimer) {
    this.currentState = this.Running
  } else {
    console.error('Invalid state for interval timer started event: ' + this.currentState)
  }
  this.currentState()
}
HiitStateMachine.prototype.intervalTimerTicked = function () {
  if (this.currentState === this.Running) {
    this.currentState = this.UpdateHiitTimer
  } else {
    console.error('Invalid state for interval timer ticked event: ' + this.currentState)
  }
  this.currentState()
}
HiitStateMachine.prototype.intervalTimerStopped = function () {
  if (this.currentState === this.StopIntervalTimer) {
    this.currentState = this.Paused
  } else {
    console.error('Invalid state for interval timer stopped event: ' + this.currentState)
  }
  this.currentState()
}
HiitStateMachine.prototype.hiitTimerUpdated = function () {
  if (this.currentState === this.UpdateHiitTimer) {
    this.currentState = this.Running
  } else {
    console.error('Invalid state for timer updated event: ' + this.currentState)
  }
  this.currentState()
}
HiitStateMachine.prototype.hiitTimerFinished = function () {
  if (this.currentState === this.UpdateHiitTimer) {
    this.currentState = this.Initialized
  } else {
    console.error('Invalid state for timer finished event: ' + this.currentState)
  }
  this.currentState()
}
HiitStateMachine.prototype.settingsUpdated = function () {
  if (this.currentState === this.Configurating || this.currentState === this.ValidatingInputs) {
    this.currentState = this.ValidatingInputs
  } else {
    console.error('Invalid state for input fields input: ' + this.currentState)
  }
  this.currentState()
}
HiitStateMachine.prototype.settingsValidated = function () {
  if (this.currentState === this.ValidatingInputs) {
    this.currentState = this.Configurating
  } else {
    console.error('Invalid state for input validated: ' + this.currentState)
  }
  this.currentState()
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

  /* Playlist */
  var nextBtn = document.querySelector('button.playlist.next')
  var prevBtn = document.querySelector('button.playlist.prev')
  var openBtn = document.querySelector('button.playlist.open')
  var widget = document.getElementById('kkbox-widget')
  var accessToken = null
  var playlistNumber = 0
  var currPlaylistId = null

  nextBtn.disabled = true
  prevBtn.disabled = true
  openBtn.disabled = true

  axios.get('/token')
    .then(function (resp) {
      // Get token
      console.debug('Access token: ' + resp.data.access_token)
      nextBtn.disabled = false
      openBtn.disabled = false
      accessToken = resp.data.access_token // Global token
      return accessToken
    })
    .then(function (token) {
      // Setting up the widget
      searchWorkoutPlaylist(token, 0)
      .then(function (playlistId) {
        console.log(playlistId)
        currPlaylistId = playlistId
        widget.src = 'https://widget.kkbox.com/v1/?' +
                     'id=' + playlistId + '&' +
                     'type=playlist' + '&' +
                     'lang=en'
      })
      .catch(function (error) {
        console.log(error)
      })
    })
    .catch(function (error) {
      console.error('Error on fetching token: ' + error)
    })

  nextBtn.onclick = function () {
    nextBtn.disabled = true
    playlistNumber += 1
    searchWorkoutPlaylist(accessToken, playlistNumber)
    .then(function (playlistId) {
      console.debug('Playlist ID: ' + playlistId)
      currPlaylistId = playlistId
      nextBtn.disabled = false
      widget.src = 'https://widget.kkbox.com/v1/?' +
                   'id=' + playlistId + '&' +
                   'type=playlist' + '&' +
                   'lang=en'
    })
    .catch(function (error) {
      console.error('Error on searching playlist: ' + error)
      nextBtn.disabled = false
    })

    if (playlistNumber >= 1) {
      prevBtn.disabled = false
    }
  }

  prevBtn.onclick = function () {
    prevBtn.disabled = true
    playlistNumber -= 1
    searchWorkoutPlaylist(accessToken, playlistNumber)
    .then(function (playlistId) {
      console.debug('Playlist ID: ' + playlistId)
      currPlaylistId = playlistId
      prevBtn.disabled = false
      widget.src = 'https://widget.kkbox.com/v1/?' +
                   'id=' + playlistId + '&' +
                   'type=playlist' + '&' +
                   'lang=en'
    })
    .catch(function (error) {
      console.error('Error on searching playlist: ' + error)
      prevBtn.disabled = false
    })

    if (playlistNumber === 0) {
      prevBtn.disabled = true
    }
  }

  openBtn.onclick = function () {
    window.open('kkbox://view_and_play_playlist_' + currPlaylistId, '_self')
  }
}

document.addEventListener('DOMContentLoaded', function () { main() })
