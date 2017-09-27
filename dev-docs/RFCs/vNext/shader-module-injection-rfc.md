# RFC: Shader Injection

* **Authors**: Ib Green
* **Date**: Sep 2017
* **Status**: Draft

Notes:
* Should be moved to luma.gl


## Motivation

Being able to automatically (dynamically) inject modules into shaders would provide a lot of flexibility and simplicity to luma.gl and deck.gl applications.

An application can currently specify a list of modules to be injected into its shaders, however it still needs to manually modify its shaders to call those modules.


## Overview

* Application Customization, extending an existing shader by injecting a few lines when subclassing modules or layers
* Automatic Shader Module Injection


## Proposal

```js
new Model(gl, {
  vs, fs,
  modules: [
  	'picking',
  	['lighting', ``]
  }
});
```

### Vertex shader


### Fragment shader

A common pattern is for shader modules to offer a fragment shader that exposes a single primary `<module>_filterColor()` method. This needs to be added to the fragment shader. Normally the only thing that matters is the order of the filterColor calls from different modules.

By adding a priority value (integer) to each shader module definition, the assembleShaders system could automatically inject these `_filterColor()` calls in the right order simply by walking the list of requested modules.


### Identifying where to inject

A simple convention can be that the main function must come last in the app shader, and we can just find the last brace in the file and start injecting before that.

For more control, we can let application give injection hints:

In vertex.glsl

TBD - the vertex shader code usually involves wiring up the module with specific attributes.


In fragment.glsl
```
main() {
   ... // Application code

   FILTER_COLOR(100); // injects filter color in order for any module below given value
   FILTER_COLOR(picking); // injects filter color in order for any module below given value

   ... // Additional application code

   FILTER_COLOR(); // Any additional filter colors
```

## Proposal: Shader Module Changes

The shader modules are expected to define relative priorities of their `<module>_filterColor` calls, so that assembleShaders can automatically order the selected injections.

Perhaps priorities could be given explicitly by the app when listing shader modules?
