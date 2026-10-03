# Collision development apps

From the repository root, install dependencies with `yarn`, then run:

```sh
yarn vite test/apps/collision --config test/apps/vite.config.local.mjs --port 8080 --open false
```

Open [the text collision app](http://localhost:8080/text.html). It uses local synthetic data and needs no basemap, network data, or access token. The original geographic, CARTO, and mask examples remain at `/` and require their app dependencies and network access.

The text app includes paired labels with explicit priorities, multiline and whitespace scenes, and a 10,000-label stress scene. Change anchors, baselines, offsets, rotation, size, collision scale, background, SDF, billboard mode, zoom, or device pixel ratio. Toggle GeoJSON to exercise the corresponding text accessors. Dots show unshifted geographic anchors. Use the mouse to pan and zoom; Reset view restores the camera.

Toggle **Two layers, shared group** to put the high- and low-priority labels in separate layers that share a collision group. This also works with GeoJSON text and the stress scene. Device pixel ratio supports fractional values, including 1.25 and 1.5.

Font family and weight controls include `Inter, sans-serif` at weight 700. The selector uses fonts installed or already loaded in the page; selecting Inter does not download it. An unavailable family falls back according to its CSS font stack.

Run the browser matrix with the server running:

```sh
node test/apps/collision/test-text.mjs
```

It checks 1,356 combinations of single-line/multiline scenes and TextLayer/GeoJSON, billboard mode, anchor, baseline, offsets, zoom and reversed priority, including both GPU-only filtering and CPU greedy placement across separate layers at pixel ratios 1, 1.5 and 2. The shared-group cases use priorities 1 and 0 to catch layer depth offsets overriding small priority differences. Geographic cases also check displayed pixels and picking at priorities 999, 1000 and -1000, where clipping-plane rounding can differ between hardware GPUs and software rendering. At low zoom only the higher-priority member of each pair is pickable; at high zoom both separated labels are pickable. For a hardware browser run on macOS, use `COLLISION_TEST_GPU=metal node test/apps/collision/test-text.mjs`. The render suite additionally checks sizing overrides, rotation, wrapping, clipping, outlines, backgrounds, narrow glyphs, and priority across separate layers:

```sh
RENDER_TEST_DEVICE=webgl yarn test-render --reporter=dot test/render/text-collision.spec.ts
```

The Benchmark button measures 150 animation frames after a 30-frame warmup while panning and zooming. It reports median and p95 frame intervals. For useful FPS measurements, use a foreground browser with hardware acceleration, keep the viewport and device pixel ratio fixed, and close other GPU workloads. Compare the same scene with collisions enabled and disabled. These timings include browser scheduling and may be capped by display refresh rate.

The benchmark reports the number of visible labels alongside median and p95 frame times. Use the stress scene to check both packing and speed. Greedy placement (`collisionGreedy`, off by default) reuses space from rejected labels; disabling it restores GPU-only filtering for lower overhead. Toggle Anchor points to inspect text without the underlying grid of dots.

## Comparing operating systems

Serve the same checkout to both browsers by adding `--host 0.0.0.0` to the development server command, then open `http://<server-ip>:8080/text.html` from the other machine. Set `COLLISION_TEST_URL` to that URL when running the browser matrix against a remote server. Match the viewport, device pixel ratio, font settings and scene before comparing results.

System fonts with the same family name can have different glyph metrics across operating systems. Collision rectangles follow those glyph bounds, so labels close to touching can produce different placements, especially with greedy placement in dense scenes. For a controlled comparison, load the same webfont file on both machines and wait for it to finish loading before creating the TextLayer. Font rasterization can still produce small differences in glyph bounds. Matching a family name such as `Arial` alone does not guarantee matching font metrics.
