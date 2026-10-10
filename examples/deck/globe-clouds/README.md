# Globe weather

See [setup and commands](../README.md) before running this example.

A deck.gl GlobeView scene with an animated, ray-marched spherical cloud shell on WebGPU and WebGL2.

`GlobeCloudLayer` uses the existing `clouds` density, noise and lighting functions. Positions and rays use planet-radius units; cloud altitude, thickness, scale and velocity remain in metres and seconds. The example accelerates drift so movement is visible at a global scale. These are procedural formations, not observed weather data.

The example-owned Earth surface reuses the texture from the existing globe showcase. Cloud coverage is continuous across the longitude seam and poles. The shell is depth tested, does not write depth or participate in picking, and is clipped at the planet surface. Sun direction uses globe-centered XYZ coordinates.

Run `yarn --cwd examples/deck/globe-clouds start`. Select WebGPU or WebGL2 using Device. Drag to rotate and scroll to zoom; Center restores the initial view.

The example now uses the reusable `SkyLayer` composite with one math.gl observer and
UTC clock for the sun, moon, catalog stars and cloud illumination. Toggle each sky
component separately; **Sun** and **Moon** orbit to an orientation
where the requested body is clear of the planet's silhouette. **Center** restores
the initial cloud view. The UTC hour slider uses 4 October 2026.

Sun radiance is HDR in the shader. Supported WebGPU HDR displays request an
`rgba16float`, extended-range canvas; WebGL2 and SDR canvases clamp highlights.
The GPU regression checks also verify solar radiance above one in floating-point
offscreen targets on both backends. Moon positions/phase and stellar rotation use
math.gl; disks are deliberately enlarged for exploration. Stars reuse the math.gl
catalog rather than a second astronomy data source.
