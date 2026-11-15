# River District performance measurements

The hardware-specific [baseline](apple-m2-webgpu.json) records Apple M2, Mac14,7,
16 GiB system memory, Chromium 151.0.7922.34, and a hardware WebGPU adapter reporting
`apple` / `metal-3`. It measures the production example at 1280×720, device pixel ratio 1,
with the district camera and water clock fixed at two seconds. The source revision,
operating system, adapter metadata, and all per-round results are recorded in the JSON.
The source revision identifies the local checkout; when testing a served build, the
operator must build and serve that same checkout before measuring it.

Each case settles its reflection history, warms picking allocations, renders 30 warm-up
frames, then measures 120 frames. Three rounds rotate the case order. Each sample waits
for a browser animation frame outside the timed region, redraws once, and waits for the
native WebGPU queue to complete. Automatic animation stays disabled and the runner
checks that exactly the requested frames rendered.

Completed-frame latency includes CPU submission, browser scheduling, and queue completion.
It is neither GPU-only timing nor a sustained frame-rate measurement. Fixed-time, settled
history characterizes steady rendering; it does not measure moving-camera history rejection,
continuous water animation, compilation, loading, or resize costs. Tracked memory counts
luma-owned buffer and texture allocations, not physical VRAM residency or driver overhead.
Borrowed external allocations are reported separately. Each case uses the same warmed
page; resource reuse is part of this measurement.

| Configuration | Median ms: measured / budget | Worst round p95 ms: measured / budget | Tracked MiB: measured / budget |
| --- | ---: | ---: | ---: |
| district | 2.9 / 3.7 | 3.3 / 5.0 | 28.94 / 31 |
| river | 3.7 / 4.7 | 4.3 / 6.5 | 28.94 / 31 |
| river-pencil | 3.9 / 4.9 | 4.6 / 6.9 | 28.95 / 31 |
| reflections-fast | 6.2 / 7.8 | 7.3 / 11.0 | 68.07 / 72 |
| reflections-balanced | 7.0 / 8.8 | 7.5 / 11.3 | 74.66 / 79 |
| reflections-detailed | 9.3 / 11.7 | 10.9 / 16.4 | 101.03 / 107 |
| reflections-pencil | 7.1 / 8.9 | 7.8 / 11.7 | 74.66 / 79 |

The timing thresholds allow 25% over the measured median and 50% over the worst round p95,
rounded up to 0.1 ms. Memory allows 5%, rounded up to a whole MiB. These are initial
regression thresholds for this specific environment, not cross-device performance promises.
A separate three-round production run passed these thresholds with no tracked allocation
growth in any case. Its river, Balanced, and Detailed medians were 3.7, 7.0, and 9.2 ms.
Every case also requires zero growth in tracked allocations during steady sampling.
That check does not establish absence of leaks across scene creation and destruction;
the visual checks cover lifecycle cleanup separately.

Run from this example directory against freshly built and served production assets:

```sh
CITY_SCENE_URL=http://127.0.0.1:3000/standalone-examples/city-scene \
  yarn benchmark > /tmp/city-performance-report.txt
```

To compare with the checked-in baseline without Yarn's command banners in the JSON:

```sh
CITY_SCENE_URL=http://127.0.0.1:3000/standalone-examples/city-scene \
  CITY_SCENE_BENCHMARK_BASELINE=benchmarks/apple-m2-webgpu.json \
  node scripts/benchmark.mjs > /tmp/city-performance.json
```

The comparison rejects a different machine, operating system, browser, GPU adapter, build
mode, sample count, or scene configuration. New environments need separately recorded
baselines and reviewed thresholds. Software adapters are rejected; this benchmark is an
opt-in local check and is not part of shared CI. Without `CITY_SCENE_URL`, the runner starts
a development server; those results must be kept separate from production measurements.
`CITY_SCENE_BENCHMARK_SAMPLES` and `CITY_SCENE_BENCHMARK_ROUNDS` permit exploratory runs,
but comparison requires the recorded sample count and at least three rounds.
