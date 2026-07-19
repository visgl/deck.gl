# pydeck API Surface Audit

- **Status**: Draft
- **Date**: July 2026
- **References**: PR [#10447](https://github.com/visgl/deck.gl/pull/10447) (pydeck extensions), PR [#10269](https://github.com/visgl/deck.gl/pull/10269) (view layout compiler), PR [#10242](https://github.com/visgl/deck.gl/pull/10242) (pydeck widgets)

## Summary

PR #10447 established a cheap, repeatable pattern for exposing deck.gl features in pydeck: a thin
`JSONMixin` wrapper class on the Python side that serializes to a `{"@@type": ...}` dict, plus
registration of the corresponding classes in the jupyter-widget's JSON converter catalog on the JS
side. This audit inventories what else in the deck.gl API surface is missing or poorly exposed in
pydeck and could be improved with the same (or similarly small) effort, and analyzes in depth
whether deck.gl 9.4's new declarative view configuration — the `ViewLayout` type and
`buildViewsFromViewLayout()` compiler in `@deck.gl/widgets` — can be brought to pydeck.

**Headline findings:**

1. **Effects are accidentally half-supported today** and are the clearest quick win: raw
   `@@type` dicts already hydrate into `LightingEffect`/lights, but there is no typed wrapper, no
   docs, no examples, and sun/camera lights are unreachable under their canonical names.
2. **`GlobeView` needs only a one-line alias** to shed its `_GlobeView` experimental name in
   pydeck.
3. **9.4's `ViewLayout` maps naturally onto pydeck.** Layout containers are already plain JSON
   objects and the leaf views serialize exactly like pydeck's existing `View` binding. Support
   requires a small Python wrapper plus a compile step in the jupyter-widget, gated on bumping the
   pydeck frontend to the 9.4 line.
4. **Interactive split views already work today via `SplitterWidget`** — undocumented.

## How pydeck exposure works (architecture recap)

Python side: every binding subclasses `JSONMixin`
(`bindings/pydeck/pydeck/bindings/json_tools.py`). Serialization uses
`json.dumps(..., default=default_serialize)`, which applies **recursively** to every non-primitive
— so wrapper objects nest inside other wrappers' kwargs without any extra machinery
(`json_tools.py:97-114`). Attributes are camelCased (`to_camel_case` preserves a leading
underscore), `None`s are dropped, and the class discriminator is stored under the literal attribute
key `"@@type"` via a `type` property setter (see `layer.py:171-177`, `view.py:42-48`,
`widget.py:39-45`).

JS side: `modules/jupyter-widget/src/playground/create-deck.js:42-57` builds the
`JSONConverter` catalog by auto-registering **every uppercase export** of
`modules/jupyter-widget/src/deck-bundle.js`, which re-exports `@deck.gl/core`, `layers`,
`aggregation-layers`, `geo-layers`, `mesh-layers`, `google-maps`, `json`, `widgets` — and, with
PR #10447, `extensions`. `jsonConverter.convert(jsonInput)` (`create-deck.js:235`) converts the
**entire payload recursively** (`modules/json/src/json-converter.ts:145-170`), so any nested
`{"@@type": X}` hydrates wherever it appears, as long as `X` is registered.

Two catalog quirks drive most of the gaps below:

- `classesFilter` is `x.charAt(0) === x.charAt(0).toUpperCase()`, and `'_'.toUpperCase() === '_'`,
  so experimental underscore exports **are** registered — but only under their underscore names
  (`_GlobeView`, `_SunLight`, ...). Making them usable under canonical names requires a manual
  alias, the precedent being the widget block at `create-deck.js:46-50`
  (`StatsWidget: deckExports._StatsWidget`, etc.) and `TerrainExtension` in PR #10447.
- Whole modules absent from `deck-bundle.js` are unreachable except through
  `pydeck.settings.custom_libraries`.

## Gap inventory

Ordered by value-to-effort ratio.

### 1. Effects — easy win, high value

**Current state.** `pdk.Deck` has carried an `effects` passthrough parameter for years
(`bindings/pydeck/pydeck/bindings/deck.py:42,116`), and the JS catalog already contains
`LightingEffect`, `AmbientLight`, `DirectionalLight`, and `PointLight` (uppercase `@deck.gl/core`
exports, auto-registered). `LightingEffect`'s constructor takes
`Record<string, PointLight | DirectionalLight | AmbientLight>` — arbitrary keys, discriminated at
runtime (`modules/core/src/effects/lighting/lighting-effect.ts:37,54`) — which matches the JSON
converter's `new Class(props)` calling convention exactly. The converter hydrates nested `@@type`
props before constructing the parent, so this renders a lit scene **today**, with zero code
changes:

```python
pdk.Deck(
    layers=[...],
    effects=[{
        "@@type": "LightingEffect",
        "ambientLight": {"@@type": "AmbientLight", "color": [255, 255, 255], "intensity": 1.0},
        "sun": {"@@type": "DirectionalLight", "direction": [-1, -3, -1], "intensity": 2.0},
    }],
)
```

It is, however, undocumented, untested, and undiscoverable.

**What's missing:**

- A typed Python wrapper. Recommended shape: one generic `pdk.Effect(type, **kwargs)` mirroring
  `pdk.Extension`/`pdk.Widget`, used for both effects and lights:

  ```python
  lighting = pdk.Effect(
      "LightingEffect",
      ambient_light=pdk.Effect("AmbientLight", color=[255, 255, 255], intensity=1.0),
      sun_light=pdk.Effect("SunLight", timestamp=1554927200000, intensity=1.2),
  )
  deck = pdk.Deck(layers=[...], effects=[lighting])
  ```

  Rationale: identical to the established one-generic-wrapper-per-converter-concept precedent,
  zero per-class wrappers to keep in sync with JS, and nested-mixin serialization is already
  verified to work. The "a light is not an effect" naming awkwardness is cosmetic; raw dicts remain
  a documented equivalent, and a `pdk.Light = Effect` alias can be added later without breakage.
  Kwarg camelCasing renames the arbitrary `LightingEffect` keys (`ambient_light` → `ambientLight`),
  which is harmless since only the values are read; the shadow-enabling `_shadow` key on lights
  survives camelCasing because `to_camel_case` preserves a leading underscore.

- Canonical aliases in `create-deck.js` for the underscore light exports:
  `SunLight: deckExports._SunLight`, `CameraLight: deckExports._CameraLight`. Until a frontend
  publish carries the aliases, `"_SunLight"`/`"_CameraLight"` work as type strings.

- Tests (`tests/bindings/test_effect.py` mirroring `test_widget.py`; a converter test beside
  `test/modules/jupyter-widget/create-deck.spec.ts` asserting `props.effects[0] instanceof
  LightingEffect` with hydrated lights), a gallery example (`examples/effects/lighting_effect.py`
  in PR #10447's grouped layout — e.g. the classic extruded-polygon scene with shadows), an
  `effect.rst` doc page, and a `whats-new.md` bullet.

**Exclusion:** `PostProcessEffect` is **not** JSON-constructible — its constructor takes a luma.gl
shader-module object as the first positional argument
(`modules/core/src/effects/post-process-effect.ts:18-24`) and would crash under the converter's
`new Class(props)` convention. Document as unsupported (reachable only via
`settings.custom_libraries` with a custom bundle).

**Sequencing:** the Python wrapper for `LightingEffect` + standard lights works against the
already-published 9.3 frontend, so it can ship in a pydeck patch release immediately; only the new
aliases need a frontend publish. Land after #10447 to avoid conflicts in `create-deck.js` and the
`__init__.py`s.

Related cleanup: `pydeck/bindings/light_settings.py` is a deck.gl 8.x-era leftover that is not
wired into `Deck` at all; deprecate its docstring in favor of `Effect`.

### 2. GlobeView canonical alias — trivial

pydeck users must write `View(type="_GlobeView")` today (see
`bindings/pydeck/examples/globe_view.py:30`). Add `GlobeView: deckExports._GlobeView` to the alias
block in `create-deck.js` and update the example. One line plus docs; `_GlobeView` stays registered
for back-compat.

### 3. ViewLayout — deck.gl 9.4's declarative views, feasible in pydeck

See the dedicated section below.

### 4. SplitterWidget interactive split views — works today, undocumented

`_SplitterWidget` is already aliased to `SplitterWidget` in the catalog, and the widget manages
`deck.props.views` itself via `deck.setProps({views})`, deferring only when views are managed
externally (`modules/widgets/src/splitter-widget.tsx`, `doUpdate`). Its `viewLayout` prop's nested
`@@type` views hydrate through the converter. So this works in pydeck 0.9.x today:

```python
pdk.Deck(
    views=None,  # let the widget manage views
    widgets=[pdk.Widget(
        "SplitterWidget",
        view_layout={
            "orientation": "horizontal",
            "views": [
                {"@@type": "MapView", "id": "left", "controller": True},
                {"@@type": "MapView", "id": "right", "controller": True},
            ],
        },
    )],
)
```

Action: document it (widget docs + a gallery example). Also document that combining a
`SplitterWidget` with externally-set views is unsupported by design.

### 5. Not-bundled modules — future work, not an easy win

`@deck.gl/carto`, `@deck.gl/mapbox`, and `@deck.gl/arcgis` are absent from `deck-bundle.js`, so
their layers/overlays are unreachable without `settings.custom_libraries`. Adding them is a bundle
size tradeoff for every pydeck user and deserves its own discussion (e.g. lazy side-bundles),
rather than riding the wrapper pattern.

### 6. Dormant interactivity — out of scope

`Deck.update()` raises `NotImplementedError` and the live ipywidget transport is disabled in
pydeck 0.9 (`deck.py:179-211`); the JS event handlers (`create-deck.js:137-152`) are wired but
unreachable. Restoring this is a transport/lifecycle project (see
`pydeck-interactive-api-rfc.md`), not an API-surface wrapper, and is noted here only for
completeness.

## ViewLayout in pydeck: feasibility and design

### What the 9.4 feature is

The View Layout system (RFC PR #10269, `@deck.gl/widgets`) is a JSON-friendly declarative
description of multi-view arrangements:

- `ViewLayout` (`modules/widgets/src/view-layout/view-layout.ts:8-13`) is a discriminated union of
  **plain objects**: `{type: 'row' | 'column' | 'overlay' | 'spacer', children: [...]}` plus a
  split form `{orientation: 'horizontal' | 'vertical', views: [...], splitId, initialSplit,
  minSplit, maxSplit}`. Shared props: `width`/`height` (numbers or CSS-like strings `'50%'`,
  `'calc(100% - 180px)'`), `minPixels`, `maxPixels`, `inset`.
- Leaf children are deck.gl `View` **instances** — the plain objects describe layout containers
  only.
- `buildViewsFromViewLayout({layout, width, height, previous?, splitValues?, viewPropsById?})`
  (`modules/widgets/src/view-layout/build-views-from-view-layout.ts:125-138`) compiles the tree to
  `{views: View[], rectsById, splittersById}`. Core `Deck`'s `views` prop is unchanged — it still
  accepts only `View | View[] | null` (`modules/core/src/lib/view-manager.ts:18`), so compilation
  must happen before `setProps`.

### Why it maps naturally onto pydeck

- Layout containers are plain JSON already — no `@@type` needed, and the JSON converter passes
  plain objects through while recursing into them (`json-converter.ts:230-240`). CSS strings like
  `'50%'` are untouched (only `@@=`/`@@#` prefixes convert).
- Leaves are exactly what `pdk.View` already serializes: `{"@@type": "MapView", ...}` dicts, which
  the converter hydrates into `View` instances **in place inside the containers' `children`
  arrays**. Verified against `convertJSONRecursively`/`convertPlainObject`.

So the serialized payload needs no converter changes at all — only a compile step after
conversion.

### Design

**Python** — new `pydeck/bindings/view_layout.py`:

```python
layout = pdk.ViewLayout(
    type="row",
    children=[
        pdk.View(type="MapView", id="main", controller=True),
        pdk.ViewLayout(
            type="column",
            width="30%",
            min_pixels=200,
            children=[
                pdk.View(type="OrthographicView", id="chart", controller=True),
                pdk.ViewLayout(type="spacer", height=40),
            ],
        ),
    ],
)
deck = pdk.Deck(views=layout, ...)
```

- `ViewLayout(JSONMixin)` with `type`, `children`, `orientation`, `views`, `width`, `height`,
  `**kwargs`. **Critical difference from every other pydeck binding:** containers are discriminated
  by literal `"type"`, so `type` is stored as a normal attribute — do *not* reuse the
  `TYPE_IDENTIFIER = "@@type"` property pattern. Leaf `pdk.View`s keep `@@type`; nesting, camelCase
  (`split_id` → `splitId`, `min_pixels` → `minPixels`), and `None`-dropping come free from
  `JSONMixin`.
- Validate in `__init__`: `type` in the allowed set XOR the `orientation`+`views` split form;
  `row`/`column`/`overlay` require `children`, `spacer` forbids them; and every leaf `View` must
  have an `id` — the JS compiler throws `'Every compiled deck view must have a string id.'`, and
  failing early in Python is a far better error.
- **Payload key: ride the existing `views` key.** `Deck(views=pdk.ViewLayout(...))` serializes to
  `views: {type: 'row', ...}` (object) vs. today's array; JS discriminates with `Array.isArray` vs
  `isViewLayout`. No new `Deck` parameter, and the default `[View(type="MapView",
  controller=True)]` keeps serializing to an array unchanged.

**JS (`modules/jupyter-widget`)** — pre-req: export `isViewLayout`/`assertViewLayout` from
`@deck.gl/widgets` (currently internal; `modules/widgets/src/index.ts:18-22` exports only the
compiler and the type). Then a new `playground/view-layout-support.js`:

- After `jsonConverter.convert(jsonInput)`, if `props.views` is a hydrated layout object, compile
  with `buildViewsFromViewLayout({layout, width, height, previous})` using the container's
  `clientWidth`/`clientHeight` (deck fires `onResize` on init, correcting any fallback
  immediately), and replace `props.views` with `compiled.views`.
- Compose an `onResize` that recompiles with `previous` (structural view reuse keeps controllers
  and view state alive across resizes) and calls `setProps({views})`. Note the standalone HTML path
  currently sets **no** `onResize` (`create-deck.js:137-152` only wires handlers in widget mode) —
  the composed handler must be injected in both modes.
- Keep per-deck compile state outside the converter (the converter short-circuits on shallow-equal
  input) and reuse it in `updateDeck`.

**Splitter interactivity: phase 2.** Static `split_id`/`initial_split` are honored at compile
time. Draggable handles for arbitrary layout splitters would mean new widget UI wired to
`splittersById` + recompile with `splitValues`; meanwhile the `SplitterWidget` path (gap #4)
covers the common two-pane interactive case today.

**Version gating.** ViewLayout exists only on the 9.4 line. The recommendation is to bump the
frontend to the 9.4 alpha as part of this work so it is testable end-to-end:
`modules/jupyter-widget/package.json` deck deps to `9.4.0-alpha.1` (already true on master;
re-verify after #10447 merges, which pins 9.3.0-beta.2) and
`bindings/pydeck/pydeck/frontend_semver.py` `DECKGL_SEMVER` from `"~9.3.*"` to the 9.4 line —
noting that jsdelivr may not resolve `~9.4.*` to prerelease tags, in which case pin the exact
alpha (`PUBLISH.md` already documents the manual-edit escape hatch for prereleases). Local
development doesn't wait for a publish: `make fast-build && make copy-bundle` in
`bindings/pydeck` plus `to_html(offline=True)` or the `PYDECK_DEV_PORT` hot-reload path exercise
the local bundle.

**Files (for the eventual implementation PR):**

| Area | Files |
|---|---|
| Python | `pydeck/bindings/view_layout.py` (new), `bindings/__init__.py`, `pydeck/__init__.py`, `deck.py` (docstring), `frontend_semver.py` (release-gated) |
| JS | `modules/widgets/src/index.ts` (export guards), `modules/jupyter-widget/src/playground/view-layout-support.js` (new), `create-deck.js` (compile + onResize + updateDeck) |
| Tests | `tests/bindings/test_view_layout.py` (plain `"type"` vs leaf `@@type`, camelCasing, validation, `Deck.to_json` round-trip); `test/modules/jupyter-widget/view-layout.spec.ts` (convert → hydrated leaves → compile at fixed size → assert rects/splitters; array payload passthrough) |
| Examples/docs | `examples/views/view_layout.py`, `docs/view_layout.rst`, toctree, `whats-new.md` |

**Risks / open questions:**

- jsdelivr prerelease semver resolution (above).
- Initial container size before the first `onResize` in the iframe/HTML template — needs visual
  verification.
- Basemap sync uses the first viewport; layouts whose first view isn't the map view will look odd
  with a basemap — recommend `map_provider=None` for multi-view layouts, or document the
  first-view behavior.
- Widget-mode `updateDeck` relies on size captured from `onResize`; confirm ordering in the
  ipywidget flow.

## Recommended sequencing

1. **Now (works on the 9.3 frontend):** `pdk.Effect` + effects docs/tests/example; document the
   `SplitterWidget` split-view recipe; deprecate `LightSettings`.
2. **Next frontend publish:** `SunLight`/`CameraLight`/`GlobeView` canonical aliases.
3. **9.4-gated:** `pdk.ViewLayout` + jupyter-widget compile step, with the frontend bump to the
   9.4 alpha line; splitter-handle interactivity as a later phase.

Each item should branch from master independently of #10447 and land after it merges (shared
files: `create-deck.js`, `deck-bundle.js`, both `__init__.py`s, examples/docs gallery structure,
`create-deck.spec.ts`).
