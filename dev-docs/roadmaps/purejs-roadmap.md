# deck.gl - Roadmap for pure JS API

Status: Implemented


## Overview

A multi release plan for pure JS (non React) support in deck.gl.


References

* Blog Post: [Growing the Data Visualization Community with deck.gl v5](https://eng.uber.com/deckgl-v5/) - Story to existing and new programmers
* Blog Post: [Start Scripting with deck.gl](https://eng.uber.com/deckgl-v5/) - Introducing deck.gl to “causal” programmers.


## Release Schedule

* v6.0 - Jul 2018 - Final API adjustments based on user experience
* v5.3 - May 2018 - API adjustments based on user experience
* v5.2 - Apr 2018 - pre-launch of JS API + blog posts
* v5.1 - Feb 2018 - improved API, still as experimental exports
* v5.0 - Dec 2017 - initial API as experimental exports - already launched!


### vNext

The pure-js program has completed, but naturally some improvement opportunities remain:

* pure-js Issues - for future releases
    * Auto layout of components via views - port from React to Pure JS
    * mapbox - Interactivity of mapbox in pure-js
* Controllers
    * Move core Controller class to mjolnir.js - Xiaoji?
* API Audit
    * setProps/setParams/setOptions - agree on semantics for JS props across deck.gl and luma.gl?


### v6.0 - shipped!

* Simplify examples
    * Unify app.js and deck.gl-overlay.js in each example
    * Start reusing maps
    * Use  async props, auto resize, auto controls, auto layout in majority of examples.
    * Minimize React code in existing examples. Should be “95%” reusable JS.
* Layers
    * Use async props in more layers
* Controllers
    * Move state methods into controller subclasses - Xiaoji?
    * Document core Controller class - TBD
    * Move core Controller class to mjolnir.js - Xiaoji?
    * `Controller` respects View size
    * ViewportController React component. Remove and handle all concerns!
    * Design should consider a future multi-controller world…
* Major Version Cleanup
    * Remove deprecated components.


### v5.3 - shipped!

* Auto Controls - See if we can find an API everyone is comfortable with  ✔ (Ib/Xiaoji)
* Async Props - proof of concept - Make code clean enough to merge - Ib/Xiaoji
* Controllers - Integrate `State` hierarchy into `Controller` class hierarchy
    * Remove current `Controller` proxys, replace with underlying controller - Ib ✔
    * Move Controller subclasses and state to same files - Ib ✔
* ViewportController React component. Deprecate and handle all concerns!
    * Move functionality into Deck or controller classes.- Ib ✔
    * `TransitionManager` fully handled and coded in maintainable way - Xiaoji


### v5.2 - shipped!

* A single pure JS deck.gl API (same API both for scripts, apps and React (mostly))
    * Deck class now official export, documented ✔
    * Deck.views prop implemented   ✔
    * Deck.controller prop implemented  ✔
    * Auto resize feature implemented  ✔
    * View classes official (requirement for auto resize)  ✔
    * Go through remaining API differences and brainstorm if we can align ✔
* Multi module build support
    * Publish separate @deck.gl/core & @deck.gl/react modules   ✔
* Implement Scripting Support
    * [RFC: Standalone deck.gl](https://docs.google.com/document/d/1OJI8Z25Wk4AGO6C7vqe9KSKwm6_kluuXXC-CzznSgvE) - Technical outline of “Scripting” Support   ✔
* New scripting examples
    * Decide on which “codepen” to use, create vis.gl account  ✔
    * Decide on examples ✔
* New pure JS app examples
    * How will apps using the new API look? (examples being reviewed)  ✔
    * Settle on best approach for mapbox-gl API usage in examples.  ✔


### v5.0 & v5.1 - shipped!

Significant foundational refactorings that have already been done represents several weeks of work and include:
* Split deck.gl code base into “sub directories” (directories with controlled exports)
* Replace WebGLRenderer React component with luma.gl AnimationLoop class.
* React-independent and mapbox-independent event handling (mjolnir.js)
* Make DeckGL React component into a thin wrapper of a new ES6 class.
* Move to non-React based controller architecture, create initial Pure JS controller.
* Create initial pure JS deck.gl Examples.


## Background

This was the status as the start of the 5.1 development. A number of big refactors (listed below) had already been done mostly during 5.0 development, driven partly by:

* A long term push to make a pure JS deck.gl API to increase its appeal.
* Some external company indications that they would use deck.gl as rendering engine if separate from React
* A wish to better support a number of strong but ultimately failed attempts from community to port to Angular etc
* A wish to keep deck.gl’s React layer as thin as possible, focus functionality in ES6 code.

As a result of these refactorings deck.gl v5.0 now has a pure javascript API as part of the experimental exports. However:

* this new API is “crude” and needs more work, audit and polish.
* deck.gl’s hard dependency on React module (even when not used) has not yet been removed, which is likely not acceptable to most non-React users.
* We do not have a story for scripting (codepen style) use.

Since the biggest required refactors have already been made, we have in a sense already paid for pure JS support (in terms of work performed, instability from refactors on our 5.0 alpha branch etc) without reaping the benefits. This document proposes additional effort to complete and fully leverage the pure JS effort.
