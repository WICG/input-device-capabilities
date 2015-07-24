'use strict';
(function() {
  setup({explicit_done: true});
  
  function runTestsAndDone() {
    try {
      runTests();
    } finally {
      done();
    }
  }
  
  // Load the polyfill if requested in the URL hash
  if (location.hash.indexOf("usePolyfill") >= 0) {
      var polyfillTest = async_test("Load InputDevice support from the polyfill");
      var newScript = document.createElement('script');
      newScript.onload = polyfillTest.step_func(function() { 
        assert_true(true, "Polyfill load succeeded synchronously");
        polyfillTest.done();
        setTimeout(runTestsAndDone, 0);
      });
      newScript.onerror = polyfillTest.step_func(function() {
        done();
        assert_unreached("Polyfill load failed");
      });
      newScript.src = "../inputdevice-polyfill.js";
      document.documentElement.appendChild(newScript);
  } else {
    window.addEventListener("load", runTestsAndDone);
  }
  
  var events = [];
  var eventsReceived = {};
  var sourceDeviceReceived;
  var target;
  var asyncTests = [];

  function setEventList() {
    var expectedEvents = '';
    for (var i = 0; i < events.length; i++) {
      if (!(events[i] in eventsReceived)) {
        expectedEvents += events[i] + ' ';
      }
    }
    document.getElementById("eventList").textContent = expectedEvents;
  }

  function checkForCompletion() {
    if (Object.getOwnPropertyNames(eventsReceived).length == events.length) {
      for(var i = 0; i < asyncTests.length; i++) {
        asyncTests[i].done();
      }
    }  
  }

  function generateAsyncEventTest(eventName, inputDeviceValidator) {
    var asyncTest = async_test(eventName + " event has sourceDevice set correctly");
    target.addEventListener(eventName, function(event) {
      asyncTest.step(function() {
        assert_true(event instanceof UIEvent, "event is a UIEvent");
        if (sourceDeviceReceived) {
            assert_equals(event.sourceDevice, sourceDeviceReceived, "sourceDevice is the same object as previous events");
        } else {
          inputDeviceValidator(event.sourceDevice);
          sourceDeviceReceived = event.sourceDevice;
        }
      });
      // We want to monitor for multiple occurrences of an event until all events have been
      // received.  If some events are never received, those tests will appear as "not run"
      // while the others will be "timeout".
      if (!(eventName in eventsReceived)) {
        eventsReceived[eventName] = true;
        setEventList();
        checkForCompletion();
      }
    });
    return asyncTest;
  }

  window.runInputDeviceEventTests = function(eventNames, inputDeviceValidator) {
    events = events.concat(eventNames);
    setEventList();
    target = document.getElementById("target");
    
    for (var i = 0; i < eventNames.length; i++) {
      asyncTests.push(generateAsyncEventTest(eventNames[i], inputDeviceValidator));
    }
  };
})();

