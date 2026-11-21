# Proposed effects

Private home for experimental deck.gl effects. This package is not published.

Import `SceneBufferEffect`, `ShaderPassEffect`, `SceneShaderPassEffect`, and
`GPUGraphDeckEffect` from `@deck.gl/proposals/effects`. Geographic query effects
and their diagnostics are available from `@deck.gl/proposals/effects/query`.

Layer implementations belong in `@deck.gl/proposals/layers`. Effects own their
execution and resource lifecycle; the proposals package is not a dependency of public deck.gl modules.
