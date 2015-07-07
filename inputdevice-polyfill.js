/* inputdevice-polyfill.js - Copyright (c) Rick Byers 2015.
 * https://github.com/RByers/InputDevice
 *  
 * Uses a (not perfectly accurate) heuristic to  implement 
 * UIEvent.sourceDevice and InputDevice.firesTouchEvents.
 * Assumptions:
 *   - If sourceDevice is consulted on an event, it will be first read within
 *     one second of the original event being dispatched.  We could, instead,
 *     determine the sourceDevice as soon as any UIEvent is dispatched (eg.
 *     by hooking addEventListener) but that woudln't work for legacy onevent
 *     style handlers.
 *   - Touch and non-touch input devices aren't both being used within one
 *     second of eachother.  Eg. if you tap the screen then quickly move the
 *     mouse, we may incorrectly attribute the mouse movement to the touch
 *     device. 
 *     
 *  Browser support:
 *   - Verified working on:
 *     - Chrome 43 (Windows, Linux and Android)
 *     - IE 11 (Windows)
 *     - Firefox 38 (Linux)
 *     - Safari 8 (Mac and iOS)
 *   - Event constructors aren't supported by IE at all.
 *   - IE on Windows phone isn't supported properly (https://github.com/RByers/InputDevice/issues/13)
 *   - Won't work in IE prior to version 9 (due to lack of Object.defineProperty)
 */

(function(global) {
  'use strict';
  
  if ('InputDevice' in global|| 'sourceDevice' in UIEvent.prototype)
    return;
  
  function InputDevice(inputDeviceInit) {
      Object.defineProperty(this, '__firesTouchEvents', {
        value: (inputDeviceInit && 'firesTouchEvents' in inputDeviceInit) ? 
          inputDeviceInit.firesTouchEvents : false,
        writable: false,
        enumerable: false
      });
  };
  // Put the attributes prototype as getter functions to match the IDL. 
  InputDevice.prototype = {
    get firesTouchEvents() {
      return this.__firesTouchEvents;
    }
  }; 
  global.InputDevice = InputDevice;

  var touchDevice = new InputDevice({firesTouchEvents:true});
  var nonTouchDevice = new InputDevice({firesTouchEvents:false});
    
  // Keep track of the last time we saw a touch event.  Note that if you don't
  // already have touch handlers on your document, this can have unfortunate
  // consequences for scrolling performance.  See https://plus.google.com/+RickByers/posts/cmzrtyBYPQc.
  var lastTouchTime;
  function touchHandler(event) {
    lastTouchTime = Date.now();
  };
  document.addEventListener('touchstart', touchHandler, true);
  document.addEventListener('touchmove', touchHandler, true);
  document.addEventListener('touchend', touchHandler, true);
  document.addEventListener('touchcancel', touchHandler, true);

  var specifiedSourceDeviceName = '__inputDevicePolyfill_specifiedSourceDevice';

  // A few UIEvents aren't really input events and so should always have a null
  // source device.  Arguably we should have a list of opt-in event types instead,
  // but that probably depends on ultimately how we want to specify this behavior.
  var eventTypesWithNoSourceDevice = ['resize', 'error', 'load', 'unload', 'abort'];
  
  // We assume that any UI event that occurs within this many ms from a touch
  // event is caused by a touch device.  This needs to be a little longer than
  // the maximum tap delay on various browsers (300ms in Safari) while remaining
  // as short as possible to reduce the risk of confusing other input that happens
  // to come shortly after touch input.  
  var touchTimeConstant = 1000;
  
  Object.defineProperty(UIEvent.prototype, 'sourceDevice', {
    get: function() {
      // Handle script-generated events and events which have already had their
      // sourceDevice read.
      if (specifiedSourceDeviceName in this)
        return this[specifiedSourceDeviceName];

      // Handle non-input events.
      if (eventTypesWithNoSourceDevice.indexOf(this.type) >= 0)
        return null;
      
      // touch events may not be supported by this browser at all (eg. IE desktop).
      if (!('TouchEvent' in global))
        return nonTouchDevice;
      
      // Touch events are always generated from devices that fire touch events.
      if (this instanceof TouchEvent)
        return touchDevice;
      
      // Pointer events are special - they may come before a touch event.
      if ('PointerEvent' in global && this instanceof PointerEvent) {
        if (this.pointerType == "touch")
          return touchDevice;
        return nonTouchDevice;
      }

      // Otherwise use recent touch events to decide if this event is likely due
      // to a touch device or not.
      var sourceDevice = Date.now() < lastTouchTime + touchTimeConstant ? touchDevice : nonTouchDevice;
      
      // Cache the value to ensure it can't change over the life of the event.
      Object.defineProperty(this, specifiedSourceDeviceName, {
        value: sourceDevice,
        writable: false
      });
      
      return sourceDevice;
    },
    configurable: true,
    enumerable: true
  });
  
  // Add support for supplying a sourceDevice from JS in all UIEvent constructors.
  function augmentEventConstructor(constructorName) {
    if (!(constructorName in global))
      return;

    // IE doesn't support event constructors at all.
    // In Safari typeof constructor is 'object' while it's 'function' in other browsers.
    if (!('length' in global[constructorName]) || global[constructorName].length < 1)
      return;

    var origCtor = global[constructorName];
    global[constructorName] = function(type, initDict) {
      var sourceDevice = (initDict && initDict.sourceDevice) ? initDict.sourceDevice : null;
      // Need to explicitly remove sourceDevice from the dictionary as it would cause
      // a type error in blink when InputDevice support is disabled.
      if (initDict)
        delete initDict.sourceDevice;
      var evt = new origCtor(type, initDict);
      // Stash the sourceDevice value away for use by the UIEvent.sourceDevice
      // getter.  We could instead shadow the property on this instance, but 
      // that would be subtly different than the specified API.
      Object.defineProperty(evt, specifiedSourceDeviceName, {
        value: sourceDevice,
        writable: false
      });
      return evt;
    }
    global[constructorName].prototype = origCtor.prototype;
  };
  
  // Note that TouchEvent and SVGZoomEvent don't yet have constructors defined.
  var uiEventConstructors = ['UIEvent', 'MouseEvent', 'InputEvent', 'CompositionEvent', 'FocusEvent', 'KeyboardEvent', 'WheelEvent', 'PointerEvent'];
  for (var i = 0; i < uiEventConstructors.length; i++)
    augmentEventConstructor(uiEventConstructors[i]);

  // Ensure events created with document.createEvent always get a null sourceDevice
  var origCreateEvent = Document.prototype.createEvent;
  Document.prototype.createEvent = function(type) {
    var evt = origCreateEvent.call(this, type);
    if (evt instanceof UIEvent) {
      Object.defineProperty(evt, specifiedSourceDeviceName, {
        value: null,
        writable: false
      });
      return evt;
    }
  };
})(this);