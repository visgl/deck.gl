# Code Guidelines


## JavaScript version

We use pure ES6 with no additions. This allows us to run source code directly in modern browsers and Node versions without transpilation.

The biggest missing feature for most devs is generally:
* object spread syntax `const a = {...b, key: value}`. Use `Object.assign`.
* JSX for React apps. Use pure react api in lib (`createElement` etc). Use buble or babel to transpile examples.


## Coding Style

Prettier and eslint with Uber's standard config are used to enforce coding style, with a few exceptions:

* We allow longer line due to a preference for slightly more compact code (less lines).


## Exports

We avoid excessive index.js files and `export *` constructions, favoring explicit exports at the top level.

Experimental exports start with an underscore `_`.

We prefer individual exports over container objects to maximize tree-shakability.


## Naming

* camelCase for identifiers
* PascalCase for classes
* dash-case for filenames
* file names and class names are carefully matched
* verbNoun naming for functions and methods: 'handleEvent', not 'handle'.
* always type out identifiers, no one letter of abbreviations like `array.map(e => e + 1)`;

As always, exceptions OK where it makes sense (e.g. `AnimationLoop.start`)


## Logging

We use [probe.gl](https://uber-web.github.io/probe.gl) for all information printed to the console. The minimalist library allows us to mange formatting, repeated messages and log priority in one place.

* API deprecation and removal
* Warnings
* Errors
* Debug logs


### assert

We use `assert`s to check that proper parameters are passed.

A "philosophical" explanation of the problem that (most of) our asserts are targeting:

* Asserts move the detection of errors related to apps passing incorrect parameters from the internals of our libraries to the API surface of these libraries.
this means that app developers will get an exception immediately in code that he is familiar with (his invocation of the deck.gl API) rather than later getting a mystic failure in the internal of our library.
* In fact, several of these asserts were in fact added after a deck.gl developer spent half an hour debugging an issue just to trace it back to the app sending in a bad parameter.

> If message is not supplied, assert throws error false === true which is not helpful at all

We removed the messages since we felt that they added bloat to our already "oversized" libraries, but no additional debugging value.

* The reason that messages add no value is that as soon as an assert happens, it is trivial to turn on "break on exceptions" and rerun.
* When the debugger stops at the assert in the non-minified version, showing clearly which param is wrong in which API call, a human readable error message tends to add nothing new.

> asserts are not useful with minified version.

While there are rare cases when an error only happens in minified version, I don't see why one would want to debug in minified version. There are so many other limitations with that.
* When an error happens in production, one typically checks out the production commit and builds a debug version, and then use the technique above (turn on break on exceptions).
* Indeed, in other languages (like C) asserts are typically removed completely from the production executable so as to not impact speed and size. There are plugins in JS to do that but it really has to be done by the app build process unless we want to publish separate debug versions of the libs.
