# Input Device Capabilities
This repository contains a [proposed specification](http://WICG.github.io/InputDeviceCapabilities/) for an API that provides capability details of the underlying device that generated a DOM input event.  In particular, this enables scripts to [reliably identify MouseEvents dervied from TouchEvents](https://docs.google.com/document/d/1-ZUtS3knhJP4RbWC74fUZbNp6cbytG6Wen7hewdCtdo/edit).

This repo also contains a [a polyfill](inputdevicecapabilities-polyfill.js), and [some tests](http://WICG.github.io/InputDeviceCapabilities/tests/).  This API [first shipped](https://www.chromestatus.com/features/5681847971348480) in Chrome 47.

If this API is successfully (eg. shipped in multiple browsers) then it will hopefully be transitioned out of incubation and [into the W3C UIEvents specification](https://github.com/w3c/uievents/issues/108) as maintained by the W3C Web Platform Working Group.

## References
* [Web Updates article](https://developers.google.com/web/updates/2015/10/inputdevicecapabilities)
* [MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/InputDeviceCapabilities_API)
* [WICG Discourse thread](http://discourse.wicg.io/t/inputdevice-api-for-identifying-mouse-events-derived-from-touch/972/1)
* [Decision to import to WICG](https://lists.w3.org/Archives/Public/public-wicg/2016Jan/0000.html)
* [W3C UI Events tracking bug](https://www.w3.org/Bugs/Public/show_bug.cgi?id=28938)
* [Chromium feature entry](https://www.chromestatus.com/features/5681847971348480) and [implementation status](https://code.google.com/p/chromium/issues/detail?id=476530)
* [Firefox bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1182609)
* [WebKit bug](https://bugs.webkit.org/show_bug.cgi?id=146848)
* [Original InputDevice API brainstorming sketch](https://docs.google.com/document/d/1WLadG2dn4vlCewOmUtUEoRsThiptC7Ox28CRmYUn8Uw/edit#)
* The problem of [identifying mouse events derived from touch](https://docs.google.com/document/d/1-ZUtS3knhJP4RbWC74fUZbNp6cbytG6Wen7hewdCtdo/edit)
* Some [discussion on www-dom](https://lists.w3.org/Archives/Public/www-dom/2015JanMar/0120.html)
* Some [discussion in the Touch Events community group](http://www.w3.org/2015/03/10-touchevents-minutes.html#item02)
