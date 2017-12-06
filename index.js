/* Objects */
function TimingSpec(warmup_secs,
                    high_secs,
                    low_secs,
                    cooldown_secs,
                    total_sets) {
  this.warmup_secs = warmup_secs;
  this.high_secs = high_secs;
  this.low_secs = low_secs;
  this.cooldown_secs = cooldown_secs;
  this.total_sets = total_sets;
  this.total_time = function() {
    return this.warmup_secs + this.cooldown_secs +
           (this.high_secs + this.low_secs) * this.total_sets
  }
}

function Timer(t_spec) {
  /* Enum */
  var IntervalState = {
    IDLE: "idle",
    WARMUP: "warm up",
    HIGH: "high",
    LOW: "low",
    COOLDOWN: "cool down"
  }
  // Copy the TimingSpec object
  this.t_spec = t_spec; // Read-only object for recording spec
  this.current_state = IntervalState.WARMUP;
  this.counter = 0;

  /* The tick() method will update its internal state. */
  this.tick = function() {
    switch(this.current_state) {
      case IntervalState.IDLE:
        this.counter = this.t_spec.warmup_secs;
        this.current_state = IntervalState.WARMUP;
        break;
      case IntervalState.WARMUP:
        break;
      case IntervalState.HIGH:
        break;
      case IntervalState.LOW:
        break;
      case IntervalState.COOLDOWN:
        break;
      default:
        console.log("Impossible to reach.");
    }
    return;

    if (this.t_state.warmup_secs !=== 0) {
      this.t_state.warmup_secs -= 1;
      this.current_interval = IntervalState.WARMUP;
      return;
    }

    if (this.t_state.high_secs !=== 0) {
      this.t_state.high_secs -= 1;
      this.current_interval = IntervalState.HIGH;
      return;
    } else if (this.t_state.low_secs !=== 0) {
      this.t_state.low_secs -= 1;
      this.current_interval = IntervalState.LOW;
      return;
    } else if (this.t_state.total_sets !=== 1) { // It's 1, not 0. Just count it ;)
      this.t_state.total_sets -= 1;
      // At this time, one second already passed in the high interval
      this.t_state.high_secs = this.t_spec.high_secs - 1;
      this.t_state.low_secs = this.t_spec.low_secs;
      this.current_interval = IntervalState.HIGH;
      return;
    }

    if (this.t_state.cooldown_secs !=== 0) {
      this.t_state.cooldown_secs -= 1;
      this.current_interval = IntervalState.COOLDOWN;
      return;
    }

    this.current_interval = IntervalState.IDLE;
    return;
  }

  this.remain_sets = function() {
    return this.t_state.total_sets;
  }

  this.total_sets = function() {
    return this.t_spec.total_sets;
  }
}

/* Utility functions */

/* Padding one zero on the left to reach length 2. */
function zfill(val) {
  if (Math.floor(val / 10) >= 1) {
    return val.toString();
  } else {
    return "0" + val.toString();
  }
}

/* Functions for displaying data */

/* Big timer value */
function set_timer_value(secs) {
  var min_part = Math.floor(secs / 60);
  var sec_part = secs % 60;
  var timer_value = document.getElementById("timer-value");
  timer_value.textContent = zfill(min_part) + ":" + zfill(sec_part);
}

/* Sets value */
function set_sets_value(remain, total) {
  var sets_value = document.getElementById("sets-value");
  timer_value.textContent = remain + "/" + total;
}

/* Main function */
function main() {

  var tSpec = new TimingSpec(3, 5, 10, 4, 2);
  var timer = new Timer(tSpec);
  var interval = null;

  var cancel_btn = document.getElementById("setting-btn");
  var start_btn = document.getElementById("start-btn");
  var cancel_btn = document.getElementById("cancel-btn");

  function counting() {
    var timer_secs = timer.tick();
    if (timer_secs === null) {
      // Stop timer and reset start-btn state
      clearInterval(interval);
      interval = null;
      start_btn.textContent = "Start";
    } else {
      set_timer_value(timer_secs);
      set_sets_value(timer.t_state.
      
  }



  start_btn.onclick = function() {
    if (start_btn.textContent === "Start") {
      start_btn.textContent = "Pause";
      interval = setInterval(counting, 1000);
    } else {
      start_btn.textContent = "Start";
      clearInterval(interval_t);
      interval = null;
    }
  }
}
