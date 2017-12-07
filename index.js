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
  this.get_total_time = function() {
    return this.warmup_secs + this.cooldown_secs +
           (this.high_secs + this.low_secs) * this.total_sets
  }
}

function Timer(t_spec) {
  /* Enum */
  this.IntervalState = {
    WARMUP: "warm up",
    HIGH: "high",
    LOW: "low",
    COOLDOWN: "cool down",
    DONE: "done"
  }

  this.t_spec = Object.assign({}, t_spec);

  /* Setting up initial state */
  // Initial state will be HIGH if warm up time is to 0
  if (t_spec.warmup_secs === 0) {
    this.current_state = this.IntervalState.HIGH;
    this.counter = this.t_spec.high_secs;
  } else {
    this.current_state = this.IntervalState.WARMUP;
    this.counter = this.t_spec.warmup_secs;
  }
  // Counter for counting sets
  // Whenever a high interval is finished, it will be increased by 1
  this.done_sets = 0;
  
  /* Interfaces */
  /* The tick() method will update its internal state. */
  this.tick = function() {
    this.counter -= 1;
    switch(this.current_state) {
      case this.IntervalState.WARMUP:
        if (this.counter === 0) {
          this.counter = this.t_spec.high_secs;
          this.current_state = this.IntervalState.HIGH;
        }
        break;

      case this.IntervalState.HIGH:
        if (this.counter === 0) {
          this.done_sets += 1;
          this.counter = this.t_spec.low_secs;
          this.current_state = this.IntervalState.LOW;
        }
        break;

      case this.IntervalState.LOW:
        if (this.counter === 0) {
          if (this.done_sets === this.t_spec.total_sets) {
            // All sets are done! Congradulations!
            this.counter = this.t_spec.cooldown_secs;
            if (this.t_spec.cooldown_secs === 0) {
              this.current_state = this.IntervalState.DONE;
            } else {
              this.current_state = this.IntervalState.COOLDOWN;
            }
          } else {
            // ISYMFS!!
            this.counter = this.t_spec.high_secs;
            this.current_state = this.IntervalState.HIGH;
          }
        }
        break;

      case this.IntervalState.COOLDOWN:
        if (this.counter === 0) {
          this.counter = 0;
          this.current_state = this.IntervalState.DONE;
        }
        break;

      case this.IntervalState.DONE:
        break;

      default:
        console.log("Impossible to reach.");
    }
    return;
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

/* Functions for displaying */

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
  sets_value.textContent = zfill(remain) + "/" + zfill(total);
}

/* Sets the background of the timer block */
function set_container_background(r, g, b, a) {
  document.getElementsByClassName("container")[0]
          .style.backgroundColor = "rgba(" +
                                   r + "," + g + "," + b + "," + a + ")"
}

/* Main function */
function main() {

  var tSpec = new TimingSpec(0, 1500, 300, 0, 10);
  var timer = new Timer(tSpec);
  var interval = null;

  var setting_btn = document.getElementById("setting-btn");
  var start_btn = document.getElementById("start-btn");
  var cancel_btn = document.getElementById("cancel-btn");

  function ticking() {
    timer.tick();
    if (timer.current_state !== timer.IntervalState.DONE) {
      set_timer_value(timer.counter);
      set_sets_value(timer.done_sets, timer.t_spec.total_sets);
      switch (timer.current_state) {
        case timer.IntervalState.WARMUP:
          set_container_background(255, 255, 0, 0.9);
          break;
        case timer.IntervalState.HIGH:
          set_container_background(255, 0, 0, 0.9);
          break;
        case timer.IntervalState.LOW:
          set_container_background(0, 255, 0, 0.9);
          break;
        case timer.IntervalState.COOLDOWN:
          set_container_background(0, 0, 255, 0.9);
          break;
      }
    } else {
      set_timer_value(0);
      set_sets_value(0, timer.t_spec.total_sets);
      set_container_background(255, 255, 255, 1);
    }
  }

  start_btn.onclick = function() {
    if (start_btn.textContent === "Start") {
      start_btn.textContent = "Pause";
      interval = setInterval(ticking, 1000);
    } else {
      start_btn.textContent = "Start";
      clearInterval(interval);
      interval = null;
    }
  }
}

main();
