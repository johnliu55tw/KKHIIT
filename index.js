/* Objects */

function TimingSpec (warmupSecs, highSecs, lowSecs, cooldownSecs, totalSets) {
  this.warmupSecs = warmupSecs
  this.highSecs = highSecs
  this.lowSecs = lowSecs
  this.cooldownSecs = cooldownSecs
  this.totalSets = totalSets
  this.getTotalTime = function () {
    return this.warmupSecs + this.cooldownSecs +
           (this.highSecs + this.lowSecs) * this.totalSecs
  }
}

function Timer (tSpec) {
  /* Enum */
  this.IntervalState = {
    WARMUP: 'warm up',
    HIGH: 'high',
    LOW: 'low',
    COOLDOWN: 'cool down',
    DONE: 'done'
  }

  this.tSpec = Object.assign({}, tSpec)

  /* Setting up initial state */
  // Initial state will be HIGH if warm up time is to 0
  if (tSpec.warmupSecs === 0) {
    this.currentState = this.IntervalState.HIGH
    this.counter = this.tSpec.highSecs
  } else {
    this.currentState = this.IntervalState.WARMUP
    this.counter = this.tSpec.warmupSecs
  }
  // Counter for counting sets
  // Whenever a high interval is finished, it will be increased by 1
  this.doneSets = 0

  /* Interfaces */
  /* The tick() method will update its internal state. */
  this.tick = function () {
    this.counter -= 1
    switch (this.currentState) {
      case this.IntervalState.WARMUP:
        if (this.counter === 0) {
          this.counter = this.tSpec.highSecs
          this.currentState = this.IntervalState.HIGH
        }
        break

      case this.IntervalState.HIGH:
        if (this.counter === 0) {
          this.doneSets += 1
          this.counter = this.tSpec.lowSecs
          this.currentState = this.IntervalState.LOW
        }
        break

      case this.IntervalState.LOW:
        if (this.counter === 0) {
          if (this.doneSets === this.tSpec.totalSets) {
            // All sets are done! Congradulations!
            this.counter = this.tSpec.cooldownSecs
            if (this.tSpec.cooldownSecs === 0) {
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
        if (this.counter === 0) {
          this.counter = 0
          this.currentState = this.IntervalState.DONE
        }
        break

      case this.IntervalState.DONE:
        break

      default:
        console.log('Impossible to reach.')
    }
  }
}

/* Utility functions */

/* Padding one zero on the left to reach length 2. */
function zfill (val) {
  if (Math.floor(val / 10) >= 1) {
    return val.toString()
  } else {
    return '0' + val.toString()
  }
}

/* Parse a time string "MM:SS" string into seconds in total.
 *
 * Return:
 *   null: Invalid string.
 *
 *   Integer: Parsed time in seconds.
 */
function parseTime (tStr) {
  var timeRe = /^[0-9]{1,2}:[0-9]{1,2}$/
  if (!timeRe.test(tStr)) {
    return null
  } else {
    var mins = parseInt(tStr.split(':')[0])
    var secs = parseInt(tStr.split(':')[1])
    if (mins > 59 || secs > 59) { return null } else { return mins * 60 + secs }
  }
}

/* Functions for displaying */

/* Big timer value */
function setTimerValue (secs) {
  var minPart = Math.floor(secs / 60)
  var secPart = secs % 60
  var timerValue = document.getElementById('timer-value')
  timerValue.textContent = zfill(minPart) + ':' + zfill(secPart)
}

/* Sets value */
function setSetsValue (remain, total) {
  var setsValue = document.getElementById('sets-value')
  setsValue.textContent = zfill(remain) + '/' + zfill(total)
}

/* Sets the background of the timer block */
function setTimerBackground (r, g, b, a) {
  document.getElementsByClassName('timer-status')[0]
          .style.backgroundColor = 'rgba(' +
                                   r + ',' + g + ',' + b + ',' + a + ')'
}

/* Main function */
function main () {
  var tSpec = new TimingSpec(15, 20, 40, 300, 20)
  var timer = new Timer(tSpec)
  var interval = null

  setTimerValue(tSpec.warmupSecs)
  setSetsValue(0, tSpec.totalSets)
  setTimerBackground(255, 255, 0, 1)

  /* Buttons */
  var settingBtn = document.getElementById('setting-btn')
  var startBtn = document.getElementById('start-btn')
  var resetBtn = document.getElementById('reset-btn')
  resetBtn.disabled = true

  function ticking () {
    timer.tick()
    if (timer.currentState !== timer.IntervalState.DONE) {
      setTimerValue(timer.counter)
      setSetsValue(timer.doneSets, timer.tSpec.totalSets)
      switch (timer.currentState) {
        case timer.IntervalState.WARMUP:
          setTimerBackground(255, 255, 0, 0.9)
          break
        case timer.IntervalState.HIGH:
          setTimerBackground(255, 0, 0, 0.9)
          break
        case timer.IntervalState.LOW:
          setTimerBackground(0, 255, 0, 0.9)
          break
        case timer.IntervalState.COOLDOWN:
          setTimerBackground(0, 0, 255, 0.9)
          break
      }
    } else {
      console.log('Finished')
      resetBtn.disabled = false
      setTimerValue(0)
      setSetsValue(0, timer.tSpec.totalSets)
      setTimerBackground(255, 255, 0, 1)
      clearInterval(interval)
    }
  }

  /* Buttons behavior */
  startBtn.onclick = function () {
    if (startBtn.textContent === 'Start') {
      startBtn.textContent = 'Pause'
      document.querySelectorAll('.setting input').forEach(function (input) {
        input.disabled = true
      })
      interval = setInterval(ticking, 1000)
      resetBtn.disabled = true
    } else {
      startBtn.textContent = 'Start'
      document.querySelectorAll('.setting input').forEach(function (input) {
        input.disabled = false
      })
      clearInterval(interval)
      resetBtn.disabled = false
      interval = null
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
    if (interval !== null) {
      clearInterval(interval)
    }
    timer = new Timer(tSpec)
    setTimerValue(tSpec.warmupSecs)
    setSetsValue(0, tSpec.totalSets)
    setTimerBackground(255, 255, 0, 1)
    startBtn.textContent = 'Start'
  }

  /* Input field behavior */
  document.querySelectorAll('input.time').forEach(function (input) {
    input.oninput = function () {
      if (parseTime(input.value) === null) {
        this.style.backgroundColor = '#FF5731'
        startBtn.disabled = true
        settingBtn.disabled = true
      } else {
        startBtn.disabled = false
        settingBtn.disabled = false
        this.style.backgroundColor = 'white'
        tSpec = new TimingSpec(
                      parseTime(document.querySelector('input.warmup').value),
                      parseTime(document.querySelector('input.high').value),
                      parseTime(document.querySelector('input.low').value),
                      parseTime(document.querySelector('input.cooldown').value),
                      parseInt(document.querySelector('input.sets').value))
        timer = new Timer(tSpec)
        setTimerValue(tSpec.warmupSecs)
        setSetsValue(0, tSpec.totalSets)
        setTimerBackground(255, 255, 0, 1)
      }
    }
    input.onblur = input.onkeyup

    input.onfocus = function () {
      input.select()
      input.style.backgroundColor = 'white'
    }
  })

  var setsInput = document.querySelector('input.sets')
  setsInput.oninput = function () {
    if (this.value > 99) this.value = 99
    if (this.value < 1) this.value = 1
    this.style.backgroundColor = 'white'
    tSpec = new TimingSpec(
                  parseTime(document.querySelector('input.warmup').value),
                  parseTime(document.querySelector('input.high').value),
                  parseTime(document.querySelector('input.low').value),
                  parseTime(document.querySelector('input.cooldown').value),
                  parseInt(document.querySelector('input.sets').value))
    timer = new Timer(tSpec)
    setTimerValue(tSpec.warmupSecs)
    setSetsValue(0, tSpec.totalSets)
    setTimerBackground(255, 255, 0, 1)
  }
  setsInput.onfocus = function () {
    setsInput.select()
  }
}

main()
