# SceneRenderer (Test Automation Class, Experimental)

Takes a list of scenes (each scene specifiying a list of `Layer`s, one or more `View`s and a view state), renders each scene in a `Deck` instance, captures the output into an image and calls a callback, then renders the next scene, finally calling a completion callback.

## Methods

### constructor

Renders a series of scenes calling the `onSceneRendered` callback after each scene, and `onComplete` after all scenes have been rendered.

`new SceneRenderer({scenes, width, height, onSceneRendered, onComplete})`

* `scenes`
* `width` = 800
* `height` = 450
* `onSceneRendered`
* `onComplete` = noop


### run

`sceneRenderer.run()`

Runs the test suite, calling the callbacks.


## Callbacks

### onSceneRendered

Can return a promise. The next scene will not be rendered until this promise completes. If the return value is not a promise, next scene will be rendered immediately.
