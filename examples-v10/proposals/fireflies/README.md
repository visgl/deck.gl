# Riverfront lights and fireflies

See [setup and commands](../README.md) before running this example.

Warm lampposts line the west bank; small animated fireflies wander along the east bank.
Both reflect in the same calm river-water material used by the water example.

The two existing example URLs share one implementation. WebGPU adds HDR bloom and
shared scene-buffer inspection; WebGL2 renders additive sprites and the same planar mirrors.
Species changes the firefly emission tint without changing the lampposts.
