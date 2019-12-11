# RFC: Mobile Platform Support (WebView approach)

* **Author**: Ib Green, Tarek Sherif, Xiaoji Chen
* **Status**: Early Draft

## Summary

This RFC proposes a strategy for enabling deck.gl (and related frameworks) to be used in native mobile applications.

## Background

As deck.gl usage grows, deck.gl and related frameworks are increasingly being used through mobile devices. But today, deck.gl does not really have a clear "mobile story". deck.gl works in mobile browsers, but is not optimized for that use case or even systematically tested on those platforms.

In addition, a number of potential major use cases of deck.gl involve integration with other rendering platforms, e.g. basemaps from Google and Mapbox, that not only have first citizen support for mobile platforms but also provide native mobile clients.


## Native Mobile Platform Support Models

This document identifies three main approaches to provide support deck.gl in native Android and iOS applications:

- The "WebView model": Optimize deck.gl JavaScript for running in “web views” (native components that display a web page, and create a small mobile integration library [Android](https://developer.android.com/reference/android/webkit/WebView) and [iOS](https://developer.apple.com/documentation/uikit/uiwebview))
- The "Mapbox model": Create a separate, native code deck base for mobile clients (e.g. [mapbox-gl-js/](https://github.com/mapbox/mapbox-gl-js/) vs [mapbox-gl-native](https://github.com/mapbox/mapbox-gl-native))
- The "Google Earth Model": Port current JS code base to native and use WASM in browser (the ["Google Earth model"](https://blog.chromium.org/2019/06/webassembly-brings-google-earth-to-more.html))

This document focuses on the "WebView model" as it is a relatively modest and straightforward extension to the current deck.gl working model. While it would require a round of UI and perforamnce optimizations for mobile, small native API modules and extended test matrices, it would impose no major changes to the way deck.gl is developed.

On the other hand, the "Mapbox" and "Google Earth" models would represent major decision points for the deck.gl community, and would need significant backing/investment from some party in the ecosystem.


### The Base Map Integration Concern

Many base maps, in particular Mapbox, Google Maps and Google Earth, have native clients / renderers on mobile clients.

While these based maps can also be delivered to the mobile device by being served in a web view, any special native integration APIs or performance improvements done by the respective native integrations would be lost, potentially leading to a sub-par experience or a lack of critical features.

Further research to understand these limitations is important, as this would likely be one of the main drivers for considering an actual native client implementation of deck.gl.

### The Security Concern

There may be issues with how maps, data or scripts are loaded in a web view that are unacceptable for applications targeted e.g for some regulatory environments. Specific examples would help her.


## General Mobile Support Concerns

### Event Handling

- **deck.gl perspective controls** The major current omission. Currently tilting the map in deck.gl requires pressing a function key and is not available on mobile clients. A two- or three-finger gesture could be implemented.
- **mobile event handling fine-tuning** - Additional testing and fine-tuning of event handling.

### Test Setup

- We'd need iOS and Android examples / test client with deck.gl served through a web view.
- Make it easy to download these for testing
- Test automation?

## Mobile Optimization

Ability to run luma.gl/deck.gl benchmarks on mobile browsers for regression and some initial peformance push?

## Mobile Platform Integration

When run inside a WebViews, the browser provide some additional JavaScript APIs to access platform functionality (camera etc), we may want to leverage some of this in deck.gl.

## Native Integration SDK

Sending events between the native mobile environment and deck.gl, for instance allowing a deck.gl WebView to be combined with native buttons.
