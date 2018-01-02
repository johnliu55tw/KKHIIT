# HIIT Timer powered by KKBOX

## Introduction

High Intensity Interval Training (HIIT) is a form of interval training,
a cardiovascular exercise strategy alternating short periods of intense anaerobic exercise with less intense recovery periods.
It requires one performs a short burst of high-intensity (or max-intensity) exercise followed by a brief low-intensity activity,
repeatedly. Most of the time the high and low interval are regulated by time.
For example, the period of high and low intensity can be set to 20 and 40 seconds respectively,
and 20 sets of them form a HIIT routine, which takes 20 minutes. Therefore, for the time regulated HIIT, a timer is required.

There are a bunch of options while choosing a HIIT timer on different platforms (iOS, Android, and web-based).
However, not many of them have integrated music playing service.
If you ever worked out, you know that music could help you immerse into the mood for the coming up training set,
which makes you feel pumped and perform better. In the case of HIIT, as I mentioned before,
requires one to give their 100% effort in the high intensity period,
which means one must be emotionally ready for the coming up torture.
Thus, for the training project, I wish to design a HIIT timer with KKBOX music service integrated.

## Requirements
* Python >= 3.5
* [pipenv](https://github.com/pypa/pipenv) >= 9.0.0
* npm >= 5.0
* Modern browser

### Python runtime dependencies
* Flask
* Requests
* Gunicorn (Optional, required for Heroku deployment)

### JavaScript runtime dependencies
* axios
* javascript-state-machine

## Getting started

The server side is written in Python with Flask framework, with [Pipenv](https://docs.pipenv.org/) for managing both dev-time and run-time environment.
For the client-side, [browserify](http://browserify.org/) and npm is used to manage client side (JavaScript) stuff.
Before you go any further, please make sure all the software requirements listed in [Requirements](#requirements) are fulfilled.

### Client side (JavaScript)

browserify and npm make the building process super easy:
```shell
$ cd kkbox-hiit-timer/
$ npm install
$ npm run build
```

That's it.

### Server side

First, install Python dependencies for this project using `pipenv`:

```shell
$ pipenv install --dev
```

Now all Python denpencies should be installed.

### Client ID and secret

The client ID and secret are passed to the application by using environment variables `KKBOX_CLIENT_ID` and `KKBOX_CLIENT_SECRET`.
Please visit [KKBOX developer site](https://developer.kkbox.com/) if you don't have them.

```shell
$ export KKBOX_CLIENT_ID=<CLIENT_ID>
$ export KKBOX_CLIENT_SECRET=<CLIENT_SECRET>
```

Replace `<CLIENT_ID>` and `<CLIENT_SECRET>` with the ID and secret of yours.

### Start the web server

You could start the web server by:
```shell
$ pipenv run python3 app.py
```

And you should see something like this:
```
 * Running on http://127.0.0.1:8888/ (Press CTRL+C to quit)
 * Restarting with stat
 * Debugger is active!
 * Debugger PIN: 277-151-303
```

When you see the line ` * Running on http://127.0.0.1:8888/ (Press CTRL+C to quit)`, it means that the web server is up and running.
You can connect the Timer by entering this address: [http://127.0.0.1:8888](http://127.0.0.1:8888).
