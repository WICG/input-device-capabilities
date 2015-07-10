# InputDevice
This repository contains a [proposed specification](http://rbyers.github.io/InputDevice/inputdevice.html) for an API that provides details of the underlying device that generated a DOM input event.  It also contains an initial attempt at [a polyfill](inputdevice-polyfill.js), and [some tests](http://rbyers.github.io/InputDevice/tests/).

## References
* [W3C UI Events tracking bug](https://www.w3.org/Bugs/Public/show_bug.cgi?id=28938)
* [Chromium feature entry](https://www.chromestatus.com/features/5681847971348480) and [implementation status](https://code.google.com/p/chromium/issues/detail?id=476530)
* [Original InputDevice API brainstorming sketch](https://docs.google.com/document/d/1WLadG2dn4vlCewOmUtUEoRsThiptC7Ox28CRmYUn8Uw/edit#)
* The problem of [identifying mouse events derived from touch](https://docs.google.com/document/d/1-ZUtS3knhJP4RbWC74fUZbNp6cbytG6Wen7hewdCtdo/edit)
* Some [discussion on www-dom](https://lists.w3.org/Archives/Public/www-dom/2015JanMar/0120.html)
* Some [discussion in the Touch Events community group](http://www.w3.org/2015/03/10-touchevents-minutes.html#item02)
