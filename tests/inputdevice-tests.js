'use strict';
(function() {
  setup({explicit_done: true});
  
  function runTestsAndDone() {
    runTests();
    done();
  }
  
  // Load the polyfill if requested in the URL hash
  if (location.hash.indexOf("usePolyfill") >= 0) {
      var polyfillTest = async_test("Load InputDevice support from the polyfill");
      var newScript = document.createElement('script');
      var loaded = false;
      newScript.onload = polyfillTest.step_func(function() { 
        assert_true(true, "Polyfill load succeeded synchronously");
        polyfillTest.done();
        setTimeout(runTestsAndDone, 0);
      });
      newScript.onerror = polyfillTest.step_func(function() {
        assert_unreached("Polyfill load failed");
        polyfillTest.done();
        setTimeout(runTestsAndDone, 0);
      });
      newScript.src = "../inputdevice-polyfill.js";
      document.documentElement.appendChild(newScript);
  } else {
    window.addEventListener("load", runTestsAndDone);
  }
})();
