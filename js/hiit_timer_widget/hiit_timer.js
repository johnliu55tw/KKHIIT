const MAX_SETS = require('./constants.js').MAX_SETS
const MIN_SETS = require('./constants.js').MIN_SETS
const MAX_SECS = require('./constants.js').MAX_SECS
const MAX_MINS = require('./constants.js').MAX_MINS

module.exports.HiitTimerSetting = HiitTimerSetting
module.exports.HiitTimer = HiitTimer

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
