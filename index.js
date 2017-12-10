/* Constants */

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

/* Objects */

function TimingSpec (warmupSecs, highSecs, lowSecs, cooldownSecs, totalSets) {
  /* Constructor
   *
   * For *Secs arguments, they take either a string representation of "MM:SS",
   * or a number in seconds.
   *
   */
  try {
    this.warmupSecs = TimingSpec.parseTime(warmupSecs)
    this.highSecs = TimingSpec.parseTime(highSecs)
    this.lowSecs = TimingSpec.parseTime(lowSecs)
    this.cooldownSecs = TimingSpec.parseTime(cooldownSecs)
  } catch (e) {
    throw new Error('Unable to create TimingSpec: ' + e.message)
  }
  totalSets = parseInt(totalSets)
  if (isNaN(totalSets)) {
    throw new Error('Unable to create TimingSpec: Sets arg. is not a number.')
  } else if (totalSets > MAX_SETS) {
    throw new Error('Unable to create TimingSpec: Sets over ' + MAX_SETS + '.')
  } else if (totalSets < 1) {
    throw new Error('Unable to create TimingSpec: Sets cannot be less than 1.')
  } else {
    this.totalSets = totalSets
  }
}
TimingSpec.parseTime = function (strOrNumber) {
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

function HiitTimer (tSpec, onIntervalChange, onCounterChange, onDoneSetsChange) {
  /* Constructor
   *
   * Takes a TimingSpec and three callback functions for state changes as arguments.
   *
   */

  // State enum
  this.IntervalState = {
    WARMUP: 'warm up',
    HIGH: 'high',
    LOW: 'low',
    COOLDOWN: 'cool down',
    DONE: 'done'
  }

  this.tSpec = Object.assign({}, tSpec)

  /* Setting up initial state */
  this.currentState = this.IntervalState.WARMUP
  this.counter = this.tSpec.warmupSecs
  // Counter for counting sets
  // Whenever a high interval is finished, it will be increased by 1
  this.doneSets = 0

  /* Interfaces */

  /* State changed handlers */
  this.onIntervalChange = onIntervalChange
  this.onCounterChange = onCounterChange
  this.onDoneSetsChange = onDoneSetsChange

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
      case this.IntervalState.WARMUP:
        if (this.counter <= 0) {
          this.counter = this.tSpec.highSecs
          this.currentState = this.IntervalState.HIGH
        }
        break

      case this.IntervalState.HIGH:
        if (this.counter <= 0) {
          this.doneSets += 1
          this.counter = this.tSpec.lowSecs
          this.currentState = this.IntervalState.LOW
        }
        break

      case this.IntervalState.LOW:
        if (this.counter <= 0) {
          if (this.doneSets === this.tSpec.totalSets) {
            // All sets are done! Congradulations!
            this.counter = this.tSpec.cooldownSecs
            if (this.tSpec.cooldownSecs <= 0) {
              this.currentState = this.IntervalState.DONE
            } else {
              this.currentState = this.IntervalState.COOLDOWN
            }
          } else {
            // ISYMFS!!
            this.counter = this.tSpec.highSecs
            this.currentState = this.IntervalState.HIGH
          }
        }
        break

      case this.IntervalState.COOLDOWN:
        if (this.counter <= 0) {
          this.counter = 0
          this.currentState = this.IntervalState.DONE
        }
        break

      case this.IntervalState.DONE:
        break

      default:
        console.log('Impossible to reach.')
    }
    // Calling assigned handlers if states changed
    if (prevIntervalState !== this.currentState && this.onIntervalChange !== undefined) {
      this.onIntervalChange()
    }
    if (prevCounter !== this.currentState && this.onCounterChange !== undefined) {
      this.onCounterChange()
    }
    if (prevDoneSets !== this.doneSets && this.onDoneSetsChange !== undefined) {
      this.onDoneSetsChange()
    }
  }
}

function HiitViewStateMachine () {
  /* Internal states */
  var tSpec = new TimingSpec(15, 20, 40, 300, 20)
  var hiitTimer = new HiitTimer(tSpec)

  /* Events */
  this.Events = {
    StartBtnClicked: 1,
    SettingBtnClicked: 2,
    ResetBtnClicked: 3,
    IntervalTimerTicked: 4,
    KeyInput: 5,
    InputValidated: 6,
    InputInvalidDetected: 7,
    Auto: 8
  }

  /* Display elements */
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
    switch (hiitTimer.currentState) {
      case hiitTimer.IntervalState.WARMUP:
        style.backgroundColor = 'yellow'
        break
      case hiitTimer.IntervalState.HIGH:
        style.backgroundColor = 'red'
        break
      case hiitTimer.IntervalState.LOW:
        style.backgroundColor = 'green'
        break
      case hiitTimer.IntervalState.COOLDOWN:
        style.backgroundColor = 'blue'
        break
      case hiitTimer.IntervalState.DONE:
        style.backgroundColor = 'yellow'
        break
    }
  }

  /* Buttons */
  var settingBtn = document.getElementById('setting-btn')
  var startBtn = document.getElementById('start-btn')
  var resetBtn = document.getElementById('reset-btn')

  /* Interval timer handler and functions */
  var intervalTimerHandler = null
  function startIntervalTimer () {
    intervalTimerHandler = setInterval(function () {
      console.log(this)
      this.transition(this.Events.IntervalTimerTicked)
    }, 1000)
  }
  function stopIntervalTimer () {
    clearInterval(intervalTimerHandler)
    intervalTimerHandler = null
  }

  /* Input container */
  var inputContainer = document.querySelector('div.setting')

  /* Input fields */
  var inputFields = {
    warmup: document.querySelector('.setting input.warmup'),
    high: document.querySelector('.setting input.high'),
    low: document.querySelector('.setting input.low'),
    cooldown: document.querySelector('.setting input.cooldown'),
    sets: document.querySelector('.setting input.sets')
  }

  /* States */
  this.stateInitialized = function () {
    hiitTimer = new HiitTimer(tSpec)
    setTimerValue(hiitTimer.counter)
    setSetsValue(hiitTimer.doneSets, tSpec.totalSets)
    setTimerBackground(255, 255, 0, 1)
    startBtn.textContent = 'Start'
    startBtn.disabled = false
    resetBtn.textContent = 'Reset'
    resetBtn.disabled = true
    settingBtn.textContent = 'Setting'
    settingBtn.disabled = false
    inputContainer.style.display = 'none'
  }

  this.stateRunning = function () {
    setTimerValue(hiitTimer.counter)
    setSetsValue(hiitTimer.doneSets, tSpec.totalSets)
    setTimerBackground(hiitTimer.currentState)
    startBtn.textContent = 'Pause'
    startBtn.disabled = false
    resetBtn.textContent = 'Reset'
    resetBtn.disabled = true
    settingBtn.textContent = 'Setting'
    settingBtn.disabled = true
    inputContainer.style.display = 'none'

    if (intervalTimerHandler === null) {
      startIntervalTimer()
    }
  }

  this.stateUpdateTimer = function () {
    hiitTimer.tick()
    // Triggering Auto event
    this.transition(this.Events.Auto)
  }

  this.statePaused = function () {
    setTimerValue(hiitTimer.counter)
    setSetsValue(hiitTimer.doneSets, tSpec.totalSets)
    setTimerBackground(hiitTimer.currentState)
    startBtn.textContent = 'Start'
    startBtn.disabled = false
    resetBtn.textContent = 'Reset'
    resetBtn.disabled = false
    settingBtn.textContent = 'Setting'
    settingBtn.disabled = true
    inputContainer.style.display = 'none'

    if (intervalTimerHandler !== null) {
      stopIntervalTimer()
    }
  }

  this.stateConfigurating = function () {
    setTimerValue(null)
    setSetsValue(null)
    setTimerBackground(255, 255, 0, 1)
    startBtn.textContent = 'Start'
    startBtn.disabled = true
    resetBtn.textContent = 'Reset'
    resetBtn.disabled = true
    settingBtn.textContent = 'Setting'
    settingBtn.disabled = false
    inputContainer.style.display = 'flex'
  }

  this.stateValidatingInputs = function () {
    setTimerValue(null)
    setSetsValue(null)
    setTimerBackground(255, 255, 0, 1)
    startBtn.textContent = 'Start'
    startBtn.disabled = true
    resetBtn.textContent = 'Reset'
    resetBtn.disabled = true
    settingBtn.textContent = 'Setting'
    settingBtn.disabled = true
    inputContainer.style.display = 'flex'
    /* Validating input fields */
    // XXX This is embarrassing... Repeated try catch block !?
    // Dude, for real?
    var allPassed = true
    try {
      TimingSpec.parseTime(inputFields.warmup.value)
      inputFields.warmup.style.background = 'white'
    } catch (e) {
      inputFields.warmup.style.background = 'red'
      allPassed = false
    }

    try {
      TimingSpec.parseTime(inputFields.high.value)
      inputFields.high.style.background = 'white'
    } catch (e) {
      inputFields.high.style.background = 'red'
      allPassed = false
    }

    try {
      TimingSpec.parseTime(inputFields.low.value)
      inputFields.low.style.background = 'white'
    } catch (e) {
      inputFields.low.style.background = 'red'
      allPassed = false
    }

    try {
      TimingSpec.parseTime(inputFields.cooldown.value)
      inputFields.cooldown.style.background = 'white'
    } catch (e) {
      inputFields.cooldown.style.background = 'red'
      allPassed = false
    }

    var parsed = parseInt(inputFields.sets === null)
    if (parsed === null || parsed > MAX_SETS || parsed < MIN_SETS) {
      inputFields.sets.style.background = 'red'
      allPassed = false
    } else {
      inputFields.sets.style.background = 'white'
    }
    if (allPassed) {
      console.log('All inputs are validated. New timing spec. created.')
      tSpec = new TimingSpec(inputFields.warmup.value,
                             inputFields.high.value,
                             inputFields.low.value,
                             inputFields.cooldown.value,
                             inputFields.sets.value)
      this.transition(this.Events.InputValidated)
    }
  }

  /* State initialization */
  this.currentState = this.stateInitialized
  this.currentState()

  /* Transition function */
  this.transition = function (event) {
    switch (this.currentState) {
      case this.stateInitialized:
        switch (event) {
          case this.Events.StartBtnClicked:
            this.currentState = this.stateRunning
            break
          case this.Events.SettingBtnClicked:
            this.currentState = this.stateConfiguration
            break
          default:
            console.log('Error: unexpected event ' + event + ' in state Initialized.')
            throw new Error('Impossible')
        }
        break
      case this.stateRunning:
        switch (event) {
          case this.Events.StartBtnClicked:
            this.currentState = this.statePaused
            break
          case this.Events.IntervalTimerTicked:
            this.currentState = this.stateUpdateTimer
            break
          default:
            console.log('Error: unexpected event ' + event + ' in state Running.')
            throw new Error('Impossible')
        }
        break
      case this.stateUpdateTimer:
        switch (event) {
          case this.Events.Auto:
            this.currentState = this.stateRunning
            break
          default:
            console.log('Error: unexpected event ' + event + ' in state UpdateTimer.')
            throw new Error('Impossible')
        }
        break
      case this.statePaused:
        switch (event) {
          case this.Events.StartBtnClicked:
            this.currentState = this.stateRunning
            break
          case event === this.Events.ResetBtnClicked:
            this.currentState = this.stateInitialized
            break
          default:
            console.log('Error: unexpected event ' + event + ' in state Paused.')
            throw new Error('Impossible')
        }
        break
      case this.stateConfigurating:
        switch (event) {
          case this.Events.KeyInput:
            this.currentState = this.stateValidatingInputs
            break
          case this.Events.SettingBtnClicked:
            this.currentState = this.settingBtnClicked
            break
          default:
            console.log('Error: unexpected event ' + event + ' in state Configurating.')
            throw new Error('Impossible')
        }
        break
      case this.stateValidatingInputs:
        switch (event) {
          case this.Events.InputValidated:
            this.currentState = this.stateConfigurating
            break
          default:
            console.log('Error: unexpected event ' + event + ' in state ValidatingInputs.')
            throw new Error('Impossible')
        }
        break
      default:
        console.log('Error: Unexpected state: ' + this.currentState)
        throw new Error('Impossible')
    }
    this.currentState()
  }
  /* Registering */
  startBtn.onclick = function () {
    console.log(this)
    this.transition(this.Events.StartBtnClicked)
  }
  settingBtn.onclick = function () {
    this.transition(this.Events.SettingBtnClicked)
  }
  resetBtn.onclick = function () {
    this.transition(this.Events.ResetBtnClicked)
  }
}

/* Main */
function main2 () {
  var sm = new HiitViewStateMachine()
  var settingBtn = document.getElementById('setting-btn')
  var startBtn = document.getElementById('start-btn')
  var resetBtn = document.getElementById('reset-btn')
  /* Registering */
  startBtn.onclick = function () {
    sm.transition(sm.Events.StartBtnClicked)
  }
  settingBtn.onclick = function () {
    sm.transition(sm.Events.SettingBtnClicked)
  }
  resetBtn.onclick = function () {
    sm.transition(sm.Events.ResetBtnClicked)
  }
}
main2()

/* Functions for displaying */

function setTimerValue (secs) {
  /* Set the main countdown timer value */
  var minPart = Math.floor(secs / 60)
  var secPart = secs % 60
  var timerValue = document.getElementById('timer-value')
  timerValue.textContent = zfill(minPart) + ':' + zfill(secPart)
}

function setSetsValue (remain, total) {
  /* Set the 'finished/total' sets value */
  var setsValue = document.getElementById('sets-value')
  setsValue.textContent = zfill(remain) + '/' + zfill(total)
}

function setTimerBackground (r, g, b, a) {
  /* Sets the background of the timer block */
  document.getElementsByClassName('timer-status')[0]
          .style.backgroundColor = 'rgba(' +
                                   r + ',' + g + ',' + b + ',' + a + ')'
}

/* Main function */
function main () {
  var tSpec = new TimingSpec(15, 20, 40, 300, 20)
  var intervalHandler = null

  setTimerValue(tSpec.warmupSecs)
  setSetsValue(0, tSpec.totalSets)
  setTimerBackground(255, 255, 0, 1)

  /* Buttons */
  var settingBtn = document.getElementById('setting-btn')
  var startBtn = document.getElementById('start-btn')
  var resetBtn = document.getElementById('reset-btn')
  resetBtn.disabled = true

  /* Sounds */
  var beepSound = document.getElementById('beep-sound')

  function onIntervalChangeHandler () {
    beepSound.play()
    switch (this.currentState) {
      case this.IntervalState.WARMUP:
        setTimerBackground(255, 255, 0, 0.9)
        break
      case this.IntervalState.HIGH:
        setTimerBackground(255, 0, 0, 0.9)
        break
      case this.IntervalState.LOW:
        setTimerBackground(0, 255, 0, 0.9)
        break
      case this.IntervalState.COOLDOWN:
        setTimerBackground(0, 0, 255, 0.9)
        break
      case this.IntervalState.DONE:
        resetBtn.disabled = false
        setTimerValue(0)
        setSetsValue(0, hiitTimer.tSpec.totalSets)
        setTimerBackground(255, 255, 0, 1)
        clearInterval(intervalHandler)
        break
    }
  }

  function onCounterChangeHandler () {
    setTimerValue(this.counter)
  }

  function onDoneSetsChangeHandler () {
    setSetsValue(this.doneSets, this.tSpec.totalSets)
  }

  var hiitTimer = new HiitTimer(tSpec,
                                onIntervalChangeHandler,
                                onCounterChangeHandler,
                                onDoneSetsChangeHandler)

  function onIntervelTimerEvent () {
    hiitTimer.tick()
  }

  /* Buttons behavior */
  startBtn.onclick = function () {
    if (startBtn.textContent === 'Start') {
      startBtn.textContent = 'Pause'
      document.querySelectorAll('.setting input').forEach(function (input) {
        input.disabled = true
      })
      intervalHandler = setInterval(onIntervelTimerEvent, 1000)
      resetBtn.disabled = true
    } else {
      startBtn.textContent = 'Start'
      document.querySelectorAll('.setting input').forEach(function (input) {
        input.disabled = false
      })
      clearInterval(intervalHandler)
      resetBtn.disabled = false
      intervalHandler = null
    }
  }

  settingBtn.onclick = function () {
    var setting = document.querySelector('div.setting')

    if (setting.style.display === '') { // Default value
      setting.style.display = 'none'
    } else if (setting.style.display === 'none') {
      setting.style.display = 'flex'
    } else {
      setting.style.display = 'none'
    }
  }

  resetBtn.onclick = function () {
    if (intervalHandler !== null) {
      clearInterval(intervalHandler)
    }
    hiitTimer = new HiitTimer(tSpec,
                              onIntervalChangeHandler,
                              onCounterChangeHandler,
                              onDoneSetsChangeHandler)
    setTimerValue(tSpec.warmupSecs)
    setSetsValue(0, tSpec.totalSets)
    setTimerBackground(255, 255, 0, 1)
    startBtn.textContent = 'Start'
  }

  /* Input fields behavior */
  document.querySelectorAll('.setting input').forEach(function (input) {
    input.oninput = function () {
      try {
        // Verify all the input field if any input field has inputs
        tSpec = new TimingSpec(document.querySelector('input.warmup').value,
                               document.querySelector('input.high').value,
                               document.querySelector('input.low').value,
                               document.querySelector('input.cooldown').value,
                               document.querySelector('input.sets').value)
      } catch (e) {
        this.style.backgroundColor = '#FF5731'
        startBtn.disabled = true
        settingBtn.disabled = true
        return
      }
      // Verified
      hiitTimer = new HiitTimer(tSpec,
                                onIntervalChangeHandler,
                                onCounterChangeHandler,
                                onDoneSetsChangeHandler)
      this.style.backgroundColor = 'white'
      setTimerValue(tSpec.warmupSecs)
      setSetsValue(0, tSpec.totalSets)
      setTimerBackground(255, 255, 0, 1)
      startBtn.disabled = false
      settingBtn.disabled = false
    }

    input.onblur = input.oninput

    input.onfocus = function () {
      input.select()
      input.style.backgroundColor = 'white'
    }
  })
}

// main()
