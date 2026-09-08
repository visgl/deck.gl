# Collision development apps

From the repository root, install dependencies with `yarn`, then run:

```sh
yarn vite test/apps/collision --config test/apps/vite.config.local.mjs --port 8080 --open false
```

Open [the text collision app](http://localhost:8080/text.html). It uses local synthetic data and needs no basemap, network data, or access token. The original geographic, CARTO, and mask examples remain at `/` and require their app dependencies and network access.

The text app includes paired labels with explicit priorities, multiline and whitespace scenes, and a 10,000-label stress scene. Change anchors, baselines, offsets, rotation, size, collision scale, background, SDF, billboard mode, zoom, or device pixel ratio. Toggle GeoJSON to exercise the corresponding text accessors. Dots show unshifted geographic anchors. Use the mouse to pan and zoom; Reset view restores the camera.

Run the browser matrix with the server running:

```sh
node test/apps/collision/test-text.mjs
```

It checks 1,296 combinations of single-line/multiline scenes and TextLayer/GeoJSON, billboard mode, anchor, baseline, offsets, zoom and reversed priority. At low zoom only the higher-priority member of each pair is pickable; at high zoom both separated labels are pickable. For a hardware browser run on macOS, use `COLLISION_TEST_GPU=metal node test/apps/collision/test-text.mjs`. The render suite additionally checks sizing overrides, rotation, wrapping, clipping, outlines, backgrounds, narrow glyphs, and priority across separate layers:

```sh
RENDER_TEST_DEVICE=webgl yarn test-render --reporter=dot test/render/text-collision.spec.ts
```

The Benchmark button measures 150 animation frames after a 30-frame warmup while panning and zooming. It reports median and p95 frame intervals. For useful FPS measurements, use a foreground browser with hardware acceleration, keep the viewport and device pixel ratio fixed, and close other GPU workloads. Compare the same scene with collisions enabled and disabled. These timings include browser scheduling and may be capped by display refresh rate.

The benchmark reports the number of visible labels alongside median and p95 frame times. Use the stress scene to check both packing and speed; rejected labels should leave room for separated neighbors. Toggle Anchor points to inspect text without the underlying grid of dots.
