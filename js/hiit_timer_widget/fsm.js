var HiitTimerSetting = require('./hiit_timer.js').HiitTimerSetting
var HiitTimer = require('./hiit_timer.js').HiitTimer
var HiitView = require('./view.js')
var StateMachine = require('javascript-state-machine')

var HiitTimerWidget = StateMachine.factory({
  // Allowing transitions from and to the same state.
  // See https://github.com/jakesgordon/javascript-state-machine/issues/77
  observeUnchangedState: true,

  init: 'initialized',

  transitions: [
    { name: 'startBtnClicked',
      from: ['initialized', 'paused'],
      to: 'startIntervalTimer' },
    { name: 'startBtnClicked', from: 'running', to: 'stopIntervalTimer' },

    { name: 'settingBtnClicked', from: 'initialized', to: 'configurating' },
    { name: 'settingBtnClicked', from: 'configurating', to: 'initialized' },

    { name: 'resetBtnClicked', from: 'paused', to: 'initialized' },

    { name: 'intervalTimerStarted', from: 'startIntervalTimer', to: 'running' },
    { name: 'intervalTimerStopped', from: 'stopIntervalTimer', to: 'paused' },
    { name: 'intervalTimerTicked', from: 'running', to: 'updateHiitTimer' },

    { name: 'hiitTimerUpdated', from: 'updateHiitTimer', to: 'running' },
    { name: 'hiitTimerFinished', from: 'updateHiitTimer', to: 'initialized' },

    { name: 'settingsUpdated', from: 'configurating', to: 'validatingInputs' },
    { name: 'settingsUpdated', from: 'validatingInputs', to: 'validatingInputs' },
    { name: 'settingsValidated', from: 'validatingInputs', to: 'configurating' }
  ],

  data: {
    hiitSetting: new HiitTimerSetting(15, 20, 40, 300, 20), // Defaults
    hiitTimer: null,
    intervalTimerHandler: null
  },

  methods: {
    onEnterInitialized: function () {
      console.log('Entering state: initialized')
      if (this.intervalTimerHandler !== null) {
        clearInterval(this.intervalTimerHandler)
        this.intervalTimerHandler = null
      }
      this.hiitTimer = new HiitTimer(
        this.hiitSetting,
        function () {
          // Playing beep sound whenever the interval changed.
          document.getElementById('beep-sound').play()
        })
      HiitView.initialized(this.hiitTimer.counter,
                           this.hiitTimer.doneSets,
                           this.hiitTimer.hiitSetting.totalSets,
                           this.hiitTimer.currentState)
    },

    onEnterStartIntervalTimer: function () {
      console.log('Entering state: startIntervalTimer')
      // "this" is weird. The method has to be passed like this to the setInterval
      // function, or it cannot reference "this" to this state machine.
      this.intervalTimerHandler = setInterval(
        this.intervalTimerTicked.bind(this), 1000)
      setTimeout(() => this.intervalTimerStarted(), 0)
    },

    onEnterStopIntervalTimer: function () {
      console.debug('Entering state: stopIntervalTimer')
      clearInterval(this.intervalTimerHandler)
      this.intervalTimerHandler = null
      setTimeout(() => this.intervalTimerStopped(), 0)
    },

    onEnterRunning: function () {
      console.log('Entering state: running')
      HiitView.running(this.hiitTimer.counter,
                       this.hiitTimer.doneSets,
                       this.hiitTimer.hiitSetting.totalSets,
                       this.hiitTimer.currentState)
    },

    onEnterUpdateHiitTimer: function () {
      console.log('Entering state: updateHiitTimer')
      this.hiitTimer.tick()
      if (this.hiitTimer.currentState === HiitTimer.IntervalState.DONE) {
        setTimeout(() => this.hiitTimerFinished(), 0)
      } else {
        setTimeout(() => this.hiitTimerUpdated(), 0)
      }
    },

    onEnterPaused: function () {
      console.log('Entering state: paused')
      HiitView.paused(this.hiitTimer.counter,
                      this.hiitTimer.doneSets,
                      this.hiitTimer.hiitSetting.totalSets,
                      this.hiitTimer.currentState)
    },

    onEnterConfigurating: function () {
      console.log('Entering state: configurating')
      HiitView.configurating()
    },

    onEnterValidatingInputs: function () {
      console.log('Entering state: validatingInputs')
      try {
        // Verify all the input field if any input field has inputs
        this.hiitSetting = new HiitTimerSetting(document.querySelector('input.warmup').value,
                                                document.querySelector('input.high').value,
                                                document.querySelector('input.low').value,
                                                document.querySelector('input.cooldown').value,
                                                document.querySelector('input.sets').value)
      } catch (verifyResult) {
        console.log('Invalid settings detected')
        HiitView.validatingInputs(verifyResult)
        return
      }
      // All inputs are verified. Triggering settingValidated event
      setTimeout(() => this.settingsValidated(), 0)
    }
  }
})

module.exports.HiitTimerWidget = HiitTimerWidget
