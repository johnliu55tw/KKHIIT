var zfill = require('../utils.js').zfill
var HiitTimer = require('./hiit_timer.js').HiitTimer

module.exports = {
  initialized: function (timerValue, doneSets, totalSets, intervalState) {
    setTimerValue(timerValue)
    setSetsValue(doneSets, totalSets)
    setTimerBackground(intervalState)
    startBtn().textContent = 'Start'
    startBtn().disabled = false
    startBtn().style.width = '6em'
    startBtn().style.display = 'block'
    resetBtn().textContent = 'Reset'
    resetBtn().disabled = true
    resetBtn().style.width = '6em'
    resetBtn().style.display = 'block'
    settingBtn().textContent = 'Setting'
    settingBtn().disabled = false
    settingBtn().style.width = '6em'
    inputContainer().style.display = 'none'
  },

  running: function (timerValue, doneSets, totalSets, intervalState) {
    setTimerValue(timerValue)
    setSetsValue(doneSets, totalSets)
    setTimerBackground(intervalState)
    startBtn().textContent = 'Pause'
    startBtn().disabled = false
    resetBtn().textContent = 'Reset'
    resetBtn().disabled = true
    settingBtn().textContent = 'Setting'
    settingBtn().disabled = true
    inputContainer().style.display = 'none'
  },

  paused: function (timerValue, doneSets, totalSets, intervalState) {
    setTimerValue(timerValue)
    setSetsValue(doneSets, totalSets)
    setTimerBackground(intervalState)
    startBtn().textContent = 'Start'
    startBtn().disabled = false
    resetBtn().textContent = 'Reset'
    resetBtn().disabled = false
    settingBtn().textContent = 'Setting'
    settingBtn().disabled = true
    inputContainer().style.display = 'none'
  },

  configurating: function () {
    setTimerValue(null)
    setSetsValue(null)
    setTimerBackground(null)
    startBtn().textContent = 'Start'
    startBtn().disabled = true
    startBtn().style.display = 'none'
    resetBtn().textContent = 'Reset'
    resetBtn().disabled = true
    resetBtn().style.display = 'none'
    settingBtn().textContent = 'Apply'
    settingBtn().disabled = false
    settingBtn().style.width = '100%'
    inputContainer().style.display = 'flex'
    for (var key in inputField()) {
      inputField()[key].style.background = 'white'
    }
  },

  validatingInputs: function (verifyResult) {
    setTimerValue(null)
    setSetsValue(null)
    setTimerBackground(null)
    startBtn().textContent = 'Start'
    startBtn().disabled = true
    resetBtn().textContent = 'Reset'
    resetBtn().disabled = true
    settingBtn().textContent = 'Apply'
    settingBtn().disabled = true
    inputContainer().style.display = 'flex'
    for (var key in verifyResult) {
      if (verifyResult[key] === true) {
        inputField()[key].style.background = 'white'
      } else {
        inputField()[key].style.background = 'red'
      }
    }
  }
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

function settingBtn () {
  return document.getElementById('setting-btn')
}

function startBtn () {
  return document.getElementById('start-btn')
}

function resetBtn () {
  return document.getElementById('reset-btn')
}

function inputContainer () {
  // Input container
  return document.querySelector('div.setting')
}

// Input fields
function inputField () {
  return {
    warmup: document.querySelector('.setting input.warmup'),
    high: document.querySelector('.setting input.high'),
    low: document.querySelector('.setting input.low'),
    cooldown: document.querySelector('.setting input.cooldown'),
    totalSets: document.querySelector('.setting input.sets')
  }
}
