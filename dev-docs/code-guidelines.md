# Code Guidelines


## Language Features

### JavaScript/ECMAScript version

* We use pure/standard ECMAScript (stage-4 proposals) but no stage-1,2,3 proposals.
* We only use ECMAScript features that work without transpilation directly in **latest** Chrome and Node versions (this is essentially all stage-4 features).
* In rare cases, a specific library

For more information see the appendix about JavaScript versions at the end of this page.

### JSX

In React-based libraries, we avoid using JSX syntax if the amount of React included in the library is small. Instead, we use pure react api (`createElement` etc). This keeps the number of babel transforms to a minimum.

### Markdown

We use the github markdown dialect. We strive to make our docs highly readable (including working links) directly on github and handle any necessary changes for e.g. website publishing during HTML conversion.


## Coding Style

Prettier and eslint with Uber's standard config are used to enforce coding style, with a few exceptions:

* We allow longer line due to a preference for slightly more compact code (fewer lines).


## Exports

* We avoid placing excessive index.js files in every directory.
* We avoid and `export *` constructions, favoring explicit exports at the top level.
* We prefer individual exports over exporting container objects to maximize tree-shakability.

* Experimental exports start with an underscore `_`.


### Flow/TypeScript

As a general rule, our stance is to avoid using type systems until a broader standard emerges. We want our source code to be easily cut-and-pastable for reuse into any project (whether pure ECMAScript, typescript or flow based). This is probably the principle most often questioned by well-meaning users who have found flow or typescript to be useful in their own projects. It has been extensively discussed, and will only change if the primary developers of each framework want it to change.

At the same time, it is fine for React-focused libraries (such as react-map-gl) to use flow since this is common in the Facebook ecosystem. Also if a new class framework is added to the vis.gl suite from an existing codebase that already includes one of these systems, and the maintainers want to keep it (e.g. nebula.gl) then that is also OK.

While we are holding back on using type systems inside our code bases, we are very interested in offering type definition files so that applications that use flow or typescript get the benefits of type checking when using our frameworks. However, as we don't use these systems we tend to be reliant on external help and PRs.


## Naming

* camelCase for identifiers
* PascalCase for classes
* dash-case for filenames
* file names and class names are carefully matched
* verbNoun naming for functions and methods: 'handleEvent', not 'handle'.
* always type out identifiers, no one letter of abbreviations. `array.map(element => element + 1)` instead of `array.map(e => e + 1)`;

As always, exceptions OK where it makes sense (e.g. `AnimationLoop.start` breaks the verbNoun rule).


## Logging

We use [probe.gl](https://uber-web.github.io/probe.gl) for all information printed to the console. The minimalist library allows us to manage formatting, repeated messages and log priority in one place.

* API deprecation and removal
* Warnings
* Errors
* Debug logs


## asserts

We use `assert`s to check that proper parameters are passed.

We typically do not include any helpful messages to the programmer. These bloat the library and provide little additional value beyond what the developer can glean from his program breaking in the assert.

Exceptions can be made if the particular condition being asserted against is a particular pitfall for programmers and/or dependent on input data (e.g. the failure to conform to the `[lng, lat]` convention in several of our libraries).

Our frameworks have local definitions of `assert`, to avoid bundlers injecting the bloated node polyfill.


### Why do we use asserts?

The problem that (most of) our asserts are targeting:

* Asserts move the detection of errors related to apps passing incorrect parameters from the internals of our libraries to the API surface of these libraries.
* This means that app developers will get an exception immediately in code that he is familiar with (his invocation of the deck.gl API) rather than later getting a mystic failure in the internal of our library.
* A number of asserts have been added after developers "waster" time debugging issues just to trace them back to the app sending in a bad parameter.


### Why do we not include error messages in asserts?

We removed the messages since we felt that they added bundle size bloat to our already "oversized" libraries, but limited additional debugging value.

* One reason that messages add limited value is that as soon as an assert happens, it is trivial to turn on "break on exceptions" and rerun.
* When the debugger stops at the assert in the non-minified version, showing clearly which param is wrong in which API call, a human readable error message adds little.


### But, asserts are not useful with minified version?

While there are rare cases when an error only happens in the minified version, there are so many other limitations with debugging in minified versions.


### Transpiler

We use babel-preset-env to transpile code for publishing.

We use buble or babel to transpile examples.



## Appendix JavaScript Versions

ECMAScript Versions vs. Stage-4 Proposals

- ES2019 is finalized, we just need to make sure the latest Chrome (Yes) and Node 11 (?) support it before we start using it.

### [ES2016](http://2ality.com/2016/01/ecmascript-2016.html)
- Exponentiation (x ** y === Math.pow(x, y))
- Array.prototype.includes

### [ES2017](http://2ality.com/2016/02/ecmascript-2017.html)
- **Async Functions**
- **Shared memory (Transferring ArrayBuffer to workers)**
- Atomics - [Processing ArrayBuffer in multiple workers](http://2ality.com/2017/01/shared-array-buffer.html)
- Trailing commas in function parameter lists and calls
- String.prototype.padStart/padEnd
- Object.values/Object.entries, Object.getOwnPropertyDescriptors()

### [ES2018](http://2ality.com/2017/02/ecmascript-2018.html)
- **Asynchronous Iteration**
- **Object Rest/Spread Properties**
- **Promise.prototype.finally()**
- RegExp: named capture groups, Unicode Property Escapes, Lookbehind Assertions, s (dotAll) flag
- Template Literal Revision

### [ES2019](http://2ality.com/2018/02/ecmascript-2019.html)
- **Optional catch binding**
- **Array.prototype.{flat,flatMap}**
- Object.fromEntries
- String.prototype.{trimStart,trimEnd}
- Symbol.prototype.description
- Array.prototype.sort() is now required to be stable
- Internal: Well-formed JSON.stringify, JSON superset, Function.prototype.toString revision

### NOT PART OF ECMAScript
- [Class Fields](https://github.com/tc39/proposal-class-fields)
- [Arrow Methods](https://medium.com/@charpeni/arrow-functions-in-class-properties-might-not-be-as-great-as-we-think-3b3551c440b1) etc
- ...
