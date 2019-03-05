# RFC: Effects Manager

* **Authors**: Ravi Akkenapally & Ib Green
* **Date**: Aug 2017
* **Status**: Early draft, not ready for formal review.


## Motivation

The addition of visual effects, like lighting, shadows, fog as well as postprocessing effects like bloom, blur, SSAO, antialiasing etc. can take a visualization to a completely new level.

This RFC outlines how a build-out of deck.gl's experimental effects engine could look.


## Proposal: Treat Effects as Layers

Today deck.gl treats its layer list as reactive, immutable components, however the effect list is a list of mutable classes. This is very poor API design that will confuse even experienced users.

The proposed way to address this would be to also make the Effects into immutable objects with props that would be matched just like layers are.

Clearly, we do not want to implement to separate Reactive Life Cycle managers, so we would want to generalize the existing layer manager to also handle effects.

Note: This would be a fairly delicate engineering task, best performed by someone with experience in (or interesting in building experience with) the layer manager and the layer lifecycle.


## Proposal: Use Effects to manage "Prop Bundles"

The best example here might be the lighting support that we have built-in to all our extrusion enabled core layers. Fully configuring lighting support requires a big bundle of props to be sent to each layer.

Since it is rare that one would use different lighting parameters on different layers, not only is it wasteful to keep sending these params to each layer, but also it adds a lot of unnecessary plumbing in the application code (declaring an object with shared lighting settings in some constants file, importing it in each file that instantiates a layer etc).

A solution to this could be to create a `LightingEffect` subclass that contain all the parameters. These params would automatically be provided to layers without having to be supplied in every instantiation. This is listed as a separate proposal below.

Open questions if individual layers still should have an ability to override effects (enable/disable and or completely override parameters)


## Proposal: MirrorEffect

We already have an experimental MirrorEffect. We should take it through API review.


## Proposal: ShadowEffect

Sean worked on this and we have a partially function (albeit old) branch. The remaining problems were Viewport related.


## Proposal: LightingEffect

A solution to this could be to create a `LightingEffect` subclass that contain all the parameters. These params would automatically be provided to layers without having to be supplied in every instantiation.


## Proposal: BloomEffect

Ability to add bloom (highlights around bright objects) in post processing can help draw the eye to important features in a visualization.


## Proposal: SSAOEffect

Screen space ambient occlusion can add realism to e.g. cityscapes and is easy to implement.


## Proposal: Maintain Framebuffers for effects

Framebuffers are big and expensive, deck.gl should maintain them and make them available to the effects.

Many effects could just use the picking buffer we have already allocated, unless we need to keep it around.

Resource management - framebuffers (shadow buffers) take a lot of space, we will want to extend seer integration to show us how much resources effects re consuming.
