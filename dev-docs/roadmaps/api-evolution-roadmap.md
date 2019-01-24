# API Evolution Roadmap

The deck.gl core API will need to be modernized over time. Changes to the core API have a big impact, this roadmap ensures that we have a clear long-term goal to work towards.


## Core Principles

### ONE API Principle

deck.gl is designed based on a "ONE API" principle, which is intended as a strong encouragement to API designers to ensure that we do not create irreconcilable forks in our API, as we continue to improve support for the React, Pure JS, scripting, JSON etc versions of the deck.gl API. Ideally a program should be portable between versions with very small differences, and learning how to use deck.gl in one version should translate directly to all versions.

Therefore any proposals here need to consider this principle and justify the design in case of deviations. Of course, by taking the conversation one step up, and talking about imperative vs. reactive/functional paradigms we can argue that this support does not cater to one specific API version but rather to ensure that we support multiple programming paradigms. Still, these changes will make programs written in the various deck.gl API incarnations more different, so it is good to exercise constraint when possible.



## Imperative Programming API Improvements

Reference: 7.0 API

deck.gl supports both functional (react, json) and imperative (pure-js, scripting) programming paradigms. The original design was laser focused on making sure that the library is optimized "to the bone" for the react/functional programming paradigm. This has lead to an API that is slightly surprising/clunky to use for imperative style programs. This section explores smaller changes that can be done to facilitate imperative programming without compromising performance/support for react/functional programming.


### Proposal: Support partially updating layer props

Reference: 7.0 API

One could say that React "sets all the props of all the layers all the time". This is how the deck.gl API is designed (the `layers` prop needs to be completely resupplied whenever any prop in any layer changes). Imperative programs are different, they normally just want to change a few props in one layer . See [Imperative Programming RFC]().


### Proposal: Enforce updateTriggers

Reference: 7.0 API

React sets accessors again and again, often to new identical functions. To avoid performance issues, the `updateTriggers` mechanism is provided. Imperative programs are different, `updateTriggers` don't make much sense. See [Imperative Programming RFC]() for more details.


### Proposal: Proper `LayerState` class hierarchy

Reference: 7.0 API

> This is a partially related (imperative API improvements) idea that would mostly affect/benefit layer writers, rather than layer users

Something that tends to confuse imperative programmers is that the Layer class is a transient descriptor. In React, the `React.Component` subclass (the most direct equicalent to the deck.gl `Layer` sublass) is the permanent entity, while the transient descriptors are the React `Elements` (many React users do not even realize that these `Elements` are created as this happens transparently by transpiled JSX).

One way to move closer to this model would be to move towards a proper LayerState class/sublass setup.

class LineLayerState extends LayerState {
  ...
}

This would let layer subclass writers focus on the permanent part of the Layer, as opposed to putting all their logic on the "dumb" descriptor.

A number of Layer methods should probably move to the Layer state, and be forwarded for now for backwards compatibility.

More thought would also need to go into how applications could benefit from this change.
