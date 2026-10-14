# Riverfront flow

See [setup and commands](../README.md) before running this example.

Run `yarn --cwd examples/deck/flow-particles start` from the repository root. The renderer selector switches between
WebGPU and WebGL2 with float render-target support.

The riverfront is a generated local scene. Its velocity grid supplies eastward and
northward metres/second and a validity mask. Particles follow either the river current
or a field containing recirculating eddies. Missing samples exclude a patch of the river
from simulation. Pause, reset, adjust density, and click streaks to inspect stable IDs.
Bridges occlude the particles through ordinary depth testing.

`FlowParticleSimulation` owns two float state textures. `FlowParticleLayer` borrows them,
projects their positions with Deck, and renders screen-width streaks without CPU readback.
A streak extrapolates the last integration step; it is not a retained curved trajectory.

Time scale changes simulated time. Long frames advance at most 8/30 seconds and expose
dropped time in `window.flowScene.diagnostics`. The shader runs up to eight midpoint
integration steps in one draw. At 8,192 particles the state textures occupy approximately 260 KiB;
at 32,768 particles the square-packed textures occupy approximately 1 MiB. The velocity
grid occupies another 256 KiB. Shader work grows with active texture area and substeps;
transparent overdraw also grows with density, width, and trail length.

Run `yarn --cwd examples/deck/flow-particles test:visual` for rendering,
animation, pause, picking, bridge occlusion, buffer ownership, and cleanup checks on both
backends. It also reports frame timing for the three density settings. Those wall-clock
measurements include browser, rendering, and test overhead, and are not isolated GPU timings.


The 64×256 velocity grid uses `FlowFieldAtlas` with four 64×64 sample blocks. The Northern
section checkbox removes or reloads just the northern tile. The remaining field and particle
state stay allocated. The Changing currents preset uploads coherent snapshots every half
second of simulation time; pause freezes both clocks. Reset restores time zero and the seeded
particles. Field changes use the same advection shader and bilinear sampler as a single grid.
Density changes rebuild particle state while preserving the field atlas (256 KiB of GPU storage).
Trails still extrapolate the latest velocity; they do not store curved trajectory history.

The district uses the shared `RiverDistrictLayer` fixture adapter and luma.gl's Lambert
material, with the same projection, picking, and resource ownership as the other riverfront
examples. Fog and auxiliary surface output default to disabled; this example does not
allocate scene-capture targets.
