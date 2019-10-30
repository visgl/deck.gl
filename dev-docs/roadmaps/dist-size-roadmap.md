# deck.gl Roadmap: Reducing Distribution Size

* **Authors**: Ib Green, ...

## Motivation

* deck.gl + luma.gl keeps growing, at their peak > 1MB minified code
* react-map-gl pulls in mapbox which is already big
* Users are starting to show concern

It is the premise of this document that there is no single silver bullet to help us solve the distribution size issue. While we'd love to be proven wrong, it is expected that we will have to apply a combination of continued efforts in multiple areas and be thoughtful about how we organize code going forward.

## Critera

To make meaningful progress, we need to define some measurement criteria:

* Size of bundle after application minification (prod)
* Size of bundle before application minification (debug)
* Easy of debugging

While one might be tempted to focus on prod sizes, many users look at the debug sizes (which affects build/load/debug cycle speeds) so optimizing both are important. Script sizes also matter.

> A lot has already been done, see the sections towards the bottom of this doc for details.

## Proposals

### Proper Minification Techniques

STATUS: PROMISING - 20% REDUCTION?
EFFORT: FAIRLY BIG (depends on ambition level)

We currently don't run any serious minification on our code before we publish it to npm. At a minimum, we should strip comments from our published code, but we could do a lot more.

Stripping transpiled code and es6 code has different challenges. Each minifier has its own set of problems.

Have experimented with Babili which seems like an attractive solution, but a number of small issues kept popping up.

Note: Pre-minification is expected to have a bigger impact on debug builds, but can also impact prod builds (especially if we organize source code carefully like using local GL constants in luma.gl).

WORK ITEMS:
* Experiment with minification tools and settle on tool chain
* Adjust code to work well with minifiers
* Measure size (dev and prod)
* ...


## Proposal: Avoid Bundling Unused Classes/Function

There are three known techniques to achieve this in JavaScript:
* Publishing Separate Packages - IMPLEMENTED
* Tree Shaking - IMPLEMENTED, HAS LIMITATIONS, BEING IMPROVED
* Subdirectory Imports - NOT USED, DUE TO TECHNICAL COMPLICATIONS


### Subdirectory Imports

STATUS: HAS SEVERE ISSUES, NOT PURSUED

This technique (offering subdirectory imports `import ScatterplotLayer from 'deck.gl/scatterplot-layer'`) has serious complications when combined with tree shaking. Unless we can solve these this technique can not be used in deck.gl.

### Remove asserts in production

Write a babel plugin to strip asserts

STATUS: PROMISING, NEEDS EXPERIMENTATION
EFFORT: MODEST

There are npm packages that strip out asserts in production builds.

WORK ITEM:
* Experiment with assert-stripping packages for production builds
* If good results, include example/recipe in our webpage
* Use in our own apps

## Implemented

### Inline GL constants

Write a babel plugin to inline GL constantss

### Tree-Shaking

STATUS: PARTIALLY SUPPORTED, NEEDS MORE WORK
EFFORT: MODEST (doing some improvements on current state)

Requires a separate distribution that does not transpile ES6 module statement.

We have added tree-shaking examples to our repos. We can build a minimal app that uses almost no symbols from the lib and inspect what actually gets bundled (a lot is still bundled, but some things do get "shaken out").

* Only supported by certain bundlers, such as Webpack 4 (most of our users are likely on webpack, so we'll focus on Webpack 4)
* Webpack2 only gets three-shaking during minification through UglifyJs, so has no effect on debug builds.
* Tree shaking of functions works fairly well
* Tree shaking of classes has problems, due to transpiled class declarations looking like "side effects", requires build tricks to (partially) work around

WORK ITEMS:
* Continue to refine our libraries to work with tree-shaking, combat tree-shaking-defeating "side effects" so that less unused symbols are included.
* Get rollup working for deck (only works for luma today) so we have two points of reference

WEBPACK 2
* UglifyJS support for ES6 is not strong, tree shaking must be done on transpiled code

### Publishing Separate Packages

Status: IMPLEMENTED
Upside: Potentially big, especially for future growsth, although current core and layers do not partition the core functionality.
Effort: MEDIUM-LARGE (setting up monorepo/new repos)

Idea:
`import {ScatterplotLayer} from '@deck.gl/layers';`

This is mostly helpful when we have parts of the library that are clearly optional - e.g. special-purpose extra layer packages (such as s2-layers).

NEXT STEPS:
* We'd need to define a meaningful separation into sub-packages - if most apps end up importing all the modules we haven't really gained anything.

### Use Automatic Attribute Updaters

Status: IMPLEMENTED - at least for the easy use cases

Most layer attribute updaters are doing the same thing which could easily be automated, especially if we had prop types for accessors. This could remove 10-20% of the code from each layer, at the cost of layer source code being a little less easily understood.

### Dependency Reduction

Eliminate dependencies, as we cannot control how their sizes evolve.

Upside: MEDIUM - BIG
Status: IMPLEMENTED

luma.gl and deck.gl now have a minimal number of dependencies.

### Replace gl-matrix with custom math library

Status: IMPLEMENTED
Upside: about 10% size reduction
Effort: Medium

gl-matrix takes about 200KB it includes every function many that are never used. Since functions are imported as objects tree-shaking is defeated.

Creating our own math library that handpicks the most common functions from the stack-gl versions of these libraries brings the size down to about 60KB and can make this code more amenable to tree-shaking.

### Remove v4.0 Deprecated Code

Status: IMPLEMENTED
Upside: potential 5%? size reduction
Effort: SMALL, but can only happen in major release

While the amount of backwards compatible code is generally modest deck.gl contains a number of big layers (the Choropleths) that are completely duplicated by newer layers, still all apps

WORK ITEMS:
* ChoroplethLayers should be removed in next big release.

### Remove Duplicated Code

STATUS: IMPLEMENTED
Upside: 1-2% percent reduction?
EFFORT: MODEST

deck.gl and luma.gl contain duplicated code, in particular AnimationLoop/WebGLRenderer.

deck.gl and viewport-mercator-project contains some duplicate code.

WORK ITEMS:
* ChoroplethLayers were removed in next big release.

