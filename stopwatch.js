// 1 Scope
//   Reqs:
//     - Stopwatch app
//       - counts four values:
//         hours (00-99)
//         minutes (00-59)
//         seconds (00-59)
//         centiseconds (00-99) => 10 milliseconds
//       - each counter needs to utilize leading 0's on values under 10
//     - Controls
//       - Start/Stop Buttons
//         - When "start" is clicked:
//           - Timer starts running from centiseconds up
//           * Button is hidden/"stop" is shown
//
//         - when "stop" is clicked:
//           - timer stops counting
//           * button is hidden(orchestration)/"start" is shown
//
//         - peristence of count between stops/starts
//
//       - Reset button
//         - If timer is running
//           - timer stops
//           - start/stop button text to "start"
//         - counters all reset to 00
//
// 2 High Level View
//   - Counting
//     - class CountValue
//       - properties of hours, minutes, seconds, centiseconds, tickInterval
//       - tick() - that chains values into one another
//         - increment seconds(centi)
//         - evaluate seconds first; break down minutes and hours, set each accordingly
//
//     - class CountValueManager
//       - constructor - instance of CountValue to manage
//       - given instance of CountValue, will call stops, starts, resets, etc
//       - render content of instance as string (for HTML import)
//       -start() - setInterval - sets tickInterval
//       -stop() - clearInterval - clears tickInterval
//
//   - DOMUpdater
//     - use HB template to write out timer values
//       - template for building intial layout
//       - updating content of timer display
//         - updateTimer(timeString)
//       - showing/hiding certain elements (buttons)
//         - take element/node as arg, classList.add/remove classes
//
//   - CountDownApp - orchestration engine
//     - constructor -
//       properties: instance of CountValueManager
//     - bind - event listeners for ControlButton and ResetButton
//       - methods needed: - hideStartButton, hideStopButton, showStartButton,
//                           showStopButton
//                         - startTiming, stopTiming, resetTiming (new Manager)
//     - App will set event listeners on the buttons and use class functions to
//       have timer start stop etc
//     - start timer(milliseconds)
//       - call CountValueManager.start(milliseconds)
//       - set interval
//         - call DOMUpdater.updateTimer()
//
// 3 PEDAC
// CountValue
// properties: centiseconds, seconds,minutes,hours
// tick()
//   - increment centisecond by 1
//   - if centisecond = 100
    //     - set centiseconds to 0
    //     - increment seconds
    // - if seconds = 60
    //   - set seconds to 0
    //   - increment minutes
    // - if minutes = 60
    //   - set minutes to 0
    //   - increment hours

// CountValueManager
// properties:
//   - timer => instance of CountValue
//   - currentInterval => to hold active interval function
// renderCurrentTimeValue()
//   - create array of [timer.hours, timer.minutes, timer.seconds, timer.centiseconds]
//   - set value displayTime to ""
//   - map array of time sections
//     - if value is < 10
//       - return "0" + value
//     - else
//       - return String(value)
//   - join array by ":"
//   - return array
//
// start(interval)
//   - set currentInterval to setInterval(timer.tick(), interval)
// stop()
//   - clearInterval(currentInterval)
//
// DOMUpdater
// updateTimer(newTimeString)
//   - find timerDiv
//   - set innerHTML to newTimeString
// toggleElement(element)
//   - get classList
//     - toggle "hide"
//     - toggle "show"
//   * this will mean that the buttons will need to start with these classes on them
//
// CountDownApp
// constructor:
//   stopwatch = new CountValueManager
//   updateInterval
//   this.bindListeners()
//   this.startButton = querySelector('#start')
//   this.stopButton = querySelector('#stop')
//
// toggleStart()
//   - DOMUpdater.toggleElement(this.startButton);
// toggleStop()
//   - DOMUpdater.toggleElement(this.startButton);
// controlButtonToggle()
//   - this.toggleStart()
//   - this.toggleStop()
//
// updateTime()
//   DOMUpdater.updateTimer(timer.renderCurrentTimeValue());
// buttonActive(button)
//   return this.button.classList.contains('show');
// startTiming(milliseconds)
//   - this.controlButtonToggle()
//   - stopwatch.start(milliseconds)
// - this.updateInterval = setInterval(() => {
//     this.updateTime()
//   })
// stopTiming()
//   - clearInterval(this.updateInterval);
//   - this.controlButtonToggle()
// resetTiming()
//     if (buttonActive(this.startButton)) {
//       this.stopTiming()
//   }
//   - this.timer = new CountValueManager()
//   - this.updateTime()
//   - this.controlButtonToggle()
//
// event listeners:
// click on "#start"
//   - this.controlButtonToggle()
//   -startTiming(10)
//
// click on "#stop"
//   - this.controlButtonToggle()
//   - stopTiming()
//
// click on "#reset"
//   - this.resetTiming()
//
// 5
// Events:
//   - click on Start button
//   - click on Stop button
//   - click on reset button
// App:
//   - generates new CountValueManager object
//   - uses build in methods of CVM and DOMUpdater to control layout and stopwatch
//     values
//   - holds internal interval for tracking DOM updates with count Intervals
// Serializer:
//   - very little needed, built into CVM class
// API - none needed
// DOMUpdater:
//   - takes rendered time content and injects into site
//   - controls showing/hiding of buttons
// Stopwatch
class Stopwatch {
  constructor() {
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
    this.centiseconds = 0;
  }

  tick() {
    this.centiseconds += 1;

    if (this.centiseconds === 100) {
      this.centiseconds = 0;
      this.seconds += 1;
    }
    if (this.seconds === 60) {
      this.seconds = 0;
      this.minutes += 1;
    }
    if (this.minutes === 60) {
      this.minutes = 0;
      this.hours += 1;
    }
  }
}

class StopwatchManager {
  constructor() {
    this.timer = new Stopwatch;
    this.currentInterval;
    this.milliseconds = 10;
  }

  renderCurrentTimeValue() {
    let times = [this.timer.hours,
                 this.timer.minutes,
                 this.timer.seconds,
                 this.timer.centiseconds
                ];
    times = times.map(value => {
      return value < 10 ? "0" + value : value;
    });
    return times.join(':');
  }
  start() {
    this.currentInterval = setInterval(this.timer.tick.bind(this.timer), this.milliseconds);
  }
  stop() {
    clearInterval(this.currentInterval);
  }
}

// Update Interfaces
class DOMUpdater {
  constructor() {
    this.registerHandlebarsTemplates();
    this.buildStopwatchInterface();
  }

  registerHandlebarsTemplates() {
    this.templates = {};
    document.querySelectorAll("script[type='text/x-handlebars-template']")
      .forEach(template => {
        this.templates[template.getAttribute('id')] = Handlebars.compile(template.innerHTML);
      });
    document.querySelectorAll("[data-type=partial]").forEach(template => {
      Handlebars.registerPartial(template['id'], template['innerHTML']);
    });
  }
  buildStopwatchInterface() {
    document.body.innerHTML = this.templates['buildStopwatch']();
  }
  updateTimer(newTimeString) {
    document.querySelector('#stopwatch').innerHTML = newTimeString;
  }
  toggleElement(element) {
    element.classList.toggle('hide');
  }
}

// App Orchestration Engine
class StopwatchApp {
  constructor() {
    this.UPDATER = new DOMUpdater();
    this.stopwatch = new StopwatchManager();
    this.updateInterval;
    this.startButton = document.querySelector('#start');
    this.stopButton = document.querySelector('#stop');
    this.resetButton = document.querySelector('#reset');
    this.bindListeners();
  }

  bindListeners() {
    this.startButton.addEventListener('click', this.startTiming.bind(this, 10));
    this.stopButton.addEventListener('click', this.stopTiming.bind(this));
    this.resetButton.addEventListener('click', this.resetTiming.bind(this));
  }
  toggleStart() {
    this.UPDATER.toggleElement(this.startButton);
  }
  toggleStop() {
    this.UPDATER.toggleElement(this.stopButton);
  }
  controlButtonToggle() {
    this.toggleStart();
    this.toggleStop();
  }
  updateTime() {
    this.UPDATER.updateTimer(this.stopwatch.renderCurrentTimeValue());
  }
  buttonActive(button) {
    return button.classList.contains('hide');
  }
  startTiming(milliseconds) {
    this.controlButtonToggle();
    this.stopwatch.start(milliseconds);
    this.updateInterval = setInterval(this.updateTime.bind(this), milliseconds);
  }
  stopTiming() {
    clearInterval(this.updateInterval);
    this.stopwatch.stop();
    this.controlButtonToggle();
  }
  resetTiming() {
    if (this.buttonActive(this.startButton)) {
        this.stopTiming();
    }
    this.stopwatch = new StopwatchManager();
    this.updateTime();
  }
}

document.addEventListener('DOMContentLoaded', function(event) {
  const STOPWATCH = new StopwatchApp();
});
