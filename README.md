# HIIT Timer powered by KKBOX

This is a purely client-side application, just clone it and open 'index.html' to use the timer ;)

## State Machine

### State Diagram

![](./docs/state-diagram.png)

#### States

* Initialized
* Running
* UpdateTimer
* Paused
* Configurating
* InvalidConfigurations

#### Events

* StartBtnClicked
* SettingBtnClicked
* ResetBtnClicked
* InvalidInputDetected
* ValidInputDetected
* InvervalTimerTicked

### Views (Display elements)

* Counter
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

### Views under each state

#### Initialized

|   | Display | Text/Appearance |
| - | ------- | ---- |
| Counter | Show | Timer value |
| SetsIndicator | Show | Sets value |
| StartBtn | Enabled | "Start" |
| ResetBtn | Disabled | "Reset" |
| SettingBtn | Enabled | "Setting" |
| InputField | Hidden | - |
| WarmupInput | - | - |
| HighInput | - | - |
| LowInput | - | - |
| CooldownInput | - | - |
| SetsInput | - | - |

#### Running

* Interval timer should be **enabled**.

|   | Display | Text/Appearance |
| - | ------- | ---- |
| Counter | Show | Timer value |
| SetsIndicator | Show | Sets value |
| StartBtn | Enabled | "Paused" |
| ResetBtn | Disabled | "Reset" |
| SettingBtn | Disabled | "Setting" |
| InputField | Hidden | - |
| WarmupInput | - | - |
| HighInput | - | - |
| LowInput | - | - |
| CooldownInput | - | - |
| SetsInput | - | - |

#### Paused

* Interval timer should be **disabled**.

|   | Display | Text/Appearance |
| - | ------- | ---- |
| Counter | Show | Timer value |
| SetsIndicator | Show | Sets value |
| StartBtn | Enabled | "Start" |
| ResetBtn | Enabled | "Reset" |
| SettingBtn | Disabled | "Setting" |
| InputField | Hidden | - |
| WarmupInput | - | - |
| HighInput | - | - |
| LowInput | - | - |
| CooldownInput | - | - |
| SetsInput | - | - |

#### Configurating

|   | Display | Text/Appearance |
| - | ------- | ---- |
| Counter | Show | "--:--" |
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

#### InvalidConfigurations

|   | Display | Text/Appearance |
| - | ------- | ---- |
| Counter | Show | "--:--" |
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
