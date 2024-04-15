# Learning Resources

## API Documentation

The documentation for the latest release can be found on deck.gl [website](https://deck.gl/docs).

The documentation for previous releases are in the *docs* directory on the `<version-release>` branch in this repo.

## Technical Deep Dive

An in-depth view into the technical details and architectural decisions behind deck.gl. [Google Slides](https://docs.google.com/presentation/d/1qtXUQzMuIa8NYIKUa1RKfSwvgpeccY-wrPrYqsb_8rE/edit#slide=id.g7db7fb98fb_0_45)

## Live Demos

The sources of deck.gl [website demos](https://deck.gl/examples) can be found in the repo's [examples](https://github.com/visgl/deck.gl/tree/master/examples) directory. Most of the applications use React, although non-React templates are provided for developers from other ecosystems.

## Prototyping & Sharing

PureJS examples in prototyping environments. These are great templates for feature testing and bug reporting:

* deck.gl [Codepen demos](https://codepen.io/vis-gl/)
* deck.gl [Observable demos](https://beta.observablehq.com/@pessimistress)
* [RandomFractals](https://github.com/RandomFractals) [Observable DeckGL collection](https://observablehq.com/collection/@randomfractals/deckgl)
* [One-page scripting examples](http://deck.gl/showcases/gallery/)

## Community

[vis.gl's Medium blog](https://medium.com/vis-gl) 

Join our [Slack workspace](https://slack-invite.openjsf.org/) for learning and discussions.

## Self-Study

How you approach learning deck.gl will depend on your previous knowledge and how you want to use it.
- Getting familiar with the various layers and their props, and reading the basic articles in the deck.gl developer guide should of course be one of the first steps.
- Exploring the deck.gl examples is a good starting point.
- And our [blog](https://medium.com/vis-gl) contains a lot of additional information that might be helpful.

But where to go after that?

### Learning Reactive UI Programming

deck.gl is designed according to "functional UI programming" principles, popularized by frameworks like React. The key to writing good, performant deck.gl applications and layers lies in knowing how to minimize updates and redundant calculations, understanding concepts like "shallow equality" etc. This is critical when using deck.gl with React, but can still be helpful to understand when using deck.gl in non-React contexts.

There is an impressive amount of information (documentation, blog posts, educational videos, etc.) on the reactive programming paradigm in relation to modern web frameworks such as React, Flux and Redux. Where to start depends mostly on your application architecture choices. Exploring such information will take you beyond what we can cover in the basic deck.gl developer guide article on Updates.


### Understanding WebGL2/WebGPU

Knowledge of WebGL2 or WebGPU is only needed if you want to create custom layers in deck.gl. Note that while trying out a new ambitious rendering approach for a new layer will likely require deeper knowledge, it is often possible to modify or extend existing deck.gl layers (including modifying the shader code) with a surprisingly limited amount of WebGL2/WebGPU knowledge.

There are many web resources for learning WebGL2/WebGPU. [luma.gl](https://luma.gl/) documentation can be a good start.
