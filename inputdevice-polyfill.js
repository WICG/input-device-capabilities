/* inputdevice-polyfill.js - Copyright (c) Rick Byers 2015.
 * https://github.com/RByers/InputDevice
 *  
 * Uses a (not perfectly accurate) heuristic to  implement 
 * UIEvent.sourceDevice and InputDevice.firesTouchEvents.
 */

(function(global) {
  'use strict';
  
  if ('InputDevice' in global|| 'sourceDevice' in UIEvent.prototype)
    return;
  
  global.InputDevice = function(inputDeviceInit) {
    this.firesTouchEvents = inputDeviceInit.firesTouchEvents;
  };

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
  var eventTypesWithNoSourceDevice = ['resize', 'error', 'load', 'unload'];
  
  // We assume that any UI event that occurs within this many ms from a touch
  // event is caused by a touch device.  This needs to be a little longer than
  // the maximum tap delay on various browsers (300ms in Safari) while remaining
  // as short as possible to reduce the risk of confusing other input that happens
  // to come shortly after touch input.  
  var touchTimeConstant = 1000;
  
  Object.defineProperty(UIEvent.prototype, 'sourceDevice', {
    get: function() {
      // Handle script-generated events.
      if (specifiedSourceDeviceName in this)
        return this[specifiedSourceDeviceName];

      // Handle non-input events.
      if (eventTypesWithNoSourceDevice.indexOf(this.type) >= 0)
        return null;
      
      // Touch events are always generated from devices that fire touch events.
      if (this instanceof TouchEvent)
        return touchDevice;
      
      // touch events may not be supported by this browser at all (eg. IE desktop).
      if (!('TouchEvent' in global))
        return nonTouchDevice;
      
      // Pointer events are special - they may come before a touch event.
      if (this instanceof PointerEvent) {
        if (this.pointerType == "touch")
          return touchDevice;
        return nonTouchDevice;
      }

      // Otherwise use recent touch events to decide if this event is likely due
      // to a touch device or not.
      if (Date.now() < lastTouchTime + touchTimeConstant) {
        return touchDevice;
      } else {
        return nonTouchDevice;
      }
    },
    configurable: true,
    enumerable: true
  });
  
  // Add support for supplying a sourceDevice from JS in all UIEvent constructors.
  function augmentEventConstructor(constructorName) {
    if (!(constructorName in global))
      return;
    var origCtor = global[constructorName];
    global[constructorName] = function(type, initDict) {
      var evt = new origCtor(type, initDict);
      var sourceDevice = initDict.sourceDevice || null;
      // Stash the sourceDevice value away for use by the UIEvent.sourceDevice
      // getter.  We could instead shadow the property on this instance, but 
      // that would be subtly different than the specified API.
      Object.defineProperty(evt, customSourceDeviceName, {
        value: sourceDevice,
        writable: false
      });
      return evt;
    }
    global[constructorName].prototype = origCtor.prototype;
  };
  var uiEventConstructors = ['UIEvent', 'MouseEvent', 'InputEvent', 'CompositionEvent', 'FocusEvent', 'KeyboardEvent', 'WheelEvent', 'SVGZoomEvent', 'PointerEvent'];
  for (var i = 0; i < uiEventConstructors.length; i++)
    augmentEventConstructor(uiEventConstructors[i]);
  
})(this);