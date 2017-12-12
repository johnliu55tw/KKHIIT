# HIIT Timer powered by KKBOX

This is a purely client-side application, just clone it and open 'index.html' to use the timer ;)

# State Machine

## State Diagram

![](./docs/state-diagram.png)

### States

* Initialized
* StartIntervalTimer
* StopIntervalTimer
* Running
* UpdateHiitTimer
* Paused
* Configurating
* ValidatingInput

### Events

* StartBtnClicked
* SettingBtnClicked
* ResetBtnClicked
* SettingsUpdated
* *InvervalTimerStarted*
* *InvervalTimerStopped*
* *InvervalTimerTicked*
* *HiitTimerUpdated*
* *HiitTimerFinished*
* *SettingsValidated*

Note: Events' name in *italic* are triggered by the state machine itself.

## Views (Display elements)

* Counter
* CounterBackground
    * Warmup interval: `yellow`
    * High interval: `red`
    * Low interval: `green`
    * Cooldown interval: `blue`
* SetsIndicator
* StartBtn
* ResetBtn
* SettingBtn
* InputField
* WarmupInput
* HighInput
* LowInput
* CooldownInput
* SetsInput

## Entry function and appearance of each state

### Initialized

#### Entry function

* Initialize the HIIT timer algorithm bt the HIIT setting.
* Reset the interval timer by `window.clearInterval`.

#### Appearance

|   | Display | Text/Appearance |
| - | ------- | ---- |
| Counter | Show | HIIT timer counter value |
| CounterBackground | Show | `yellow` |
| SetsIndicator | Show | 0 / Total sets |
| StartBtn | Enabled | "Start" |
| ResetBtn | Disabled | "Reset" |
| SettingBtn | Enabled | "Setting" |
| InputField | Hidden | - |
| WarmupInput | - | - |
| HighInput | - | - |
| LowInput | - | - |
| CooldownInput | - | - |
| SetsInput | - | - |

### StartIntervalTimer

#### Entry function

* Starting the interval timer by `window.setInterval`
* Triggering the *IntervalTimerStarted* event after the timer started.

#### Appearance

*No appearance should be changed.*

### StopIntervalTimer

* Stopping the interval timer by `window.clearInterval`
* Triggering the *IntervalTimerStopped* event after the timer stopped.

#### Entry function

* Stop the interval

#### Appearance

*No appearance should be changed.*

### Running

#### Entry function

*No entry function.*

#### Appearance

|   | Display | Text/Appearance |
| - | ------- | ---- |
| Counter | Show | HIIT timer counter value |
| CounterBackground | Show | Depends on HIIT timer interval |
| SetsIndicator | Show | Done sets/Total sets |
| StartBtn | Enabled | "Paused" |
| ResetBtn | Disabled | "Reset" |
| SettingBtn | Disabled | "Setting" |
| InputField | Hidden | - |
| WarmupInput | - | - |
| HighInput | - | - |
| LowInput | - | - |
| CooldownInput | - | - |
| SetsInput | - | - |

### UpdateHiitTimer

#### Entry function

* Updating the HIIT timer algorithm (One second passed).
* Triggering *HiitTimerUpdated* event if the HIIT timer is still running.
* Or triggering *HiitTimerFinished* event if the HIIT timer finished (Finished the cooldown interval.).

#### Appearance

*No appearance should be changed.*

### Paused

#### Entry function

*No entry function.*

#### Appearance

|   | Display | Text/Appearance |
| - | ------- | ---- |
| Counter | Show | HIIT timer counter value |
| CounterBackground | Show | Depends on HIIT timer interval. |
| SetsIndicator | Show | Done sets/Total sets |
| StartBtn | Enabled | "Start" |
| ResetBtn | Enabled | "Reset" |
| SettingBtn | Disabled | "Setting" |
| InputField | Hidden | - |
| WarmupInput | - | - |
| HighInput | - | - |
| LowInput | - | - |
| CooldownInput | - | - |
| SetsInput | - | - |

### Configurating

#### Entry funciton

*No entry function.*

#### Appearance

|   | Display | Text/Appearance |
| - | ------- | ---- |
| Counter | Show | "--:--" |
| CounterBackground | Show | `white` |
| SetsIndicator | Show | "--/--" |
| StartBtn | Disabled | "Start" |
| ResetBtn | Disabled | "Reset" |
| SettingBtn | Enabled | "Apply" |
| InputField | Show | - |
| WarmupInput | Show | - |
| HighInput | Show | - |
| LowInput | Show | - |
| CooldownInput | Show | - |
| SetsInput | Show | - |

### ValidatingInputs

#### Entry function

* Validating all the input fields. If any of the inputs is invalid, change the input's background to `red`.
* If all inputs are valid, triggering the *SettingsValidated* event.

#### Appearance

|   | Display | Text/Appearance |
| - | ------- | ---- |
| Counter | Show | "--:--" |
| CounterBackground | Show | `white` |
| SetsIndicator | Show | "--/--" |
| StartBtn | Disabled | "Start" |
| ResetBtn | Disabled | "Reset" |
| SettingBtn | Disabled | "Apply" |
| InputField | Show | - |
| WarmupInput | Show | Background red if invalid |
| HighInput | Show | Background red if invalid |
| LowInput | Show | Background red if invalid |
| CooldownInput | Show | Background red if invalid |
| SetsInput | Show | Background red if invalid |
