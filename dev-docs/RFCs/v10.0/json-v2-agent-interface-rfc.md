# RFC: `@deck.gl/json` v2 as the agent-native interface for deck.gl

- **Authors**: Javier de la Torre (CARTO)
- **Date**: Sep 8, 2026
- **Status**: Draft, for discussion at the Open Visualization Summit, Zürich, Sep 2026
- **Related**: [JSON Layers RFC (v6.1, 2018)](../v6.1/json-layers-rfc.md) ·
  [`@deck.gl/json` v2 tracker, deck.gl-community #596](https://github.com/visgl/deck.gl-community/issues/596) ·
  [Step 1 PR #597](https://github.com/visgl/deck.gl-community/pull/597)

Summary: AI agents are becoming a primary author of deck.gl maps, and the interface they reach
for is the declarative JSON format this project designed in 2018 for "generating visualizations
from the backend without knowing how to code the front end". Several products now build on it
independently and have each rebuilt the same missing pieces: a schema, a way to know what failed,
a way to read the map back, a way to edit it incrementally, and a way to declare data sources.
This RFC proposes that `@deck.gl/json` v2 provide those pieces once, upstream, so that the
declarative format becomes deck.gl's supported interface for programs and agents.

## Motivation

### Agents already write deck.gl JSON, and mostly get it right

In experiments run for the summit (all prompts, raw outputs and harnesses in
[jatorre/deckgl-ai-ready](https://github.com/jatorre/deckgl-ai-ready)), seven current frontier
models were asked, with no tools or documentation, to write a `@deck.gl/json` choropleth. All seven
produced the `@@type` syntax, views and initial view state correctly. The failures were all in one
place, the data-driven accessor:

| Outcome | Models |
| --- | --- |
| Valid `@@=` expression | 4 of 7 |
| A vendor helper that exists only in one registry (`colorContinuous`) | 1 of 7 |
| An invented helper (`interpolateColor`, `quantileColorScale`) | 2 of 7 |
| Would fail loudly in today's converter | 0 of 7 |

Older models reached for Mapbox style-spec expressions instead. The format is learnable; the
vocabulary outside the format is not, and the runtime does not say when a guess is wrong.

### Everyone downstream rebuilt the same things

- **CARTO** renders agent-written `@deck.gl/json` inside chat clients (an MCP App). It uses the
  stock converter with a closed registry of CARTO tile layers and credential-injecting source
  functions. To make a model write a valid spec it ships a tool description of about 36 KB, half
  of which enumerates ways to get an *empty map with no error*: unregistered layer, wrong
  layer-to-source pairing, missing aggregation expression, unsupported expression. Its validator
  counts layers before and after conversion. In the same service, Vega-Lite charts are validated
  with Ajv against the official JSON Schema and the errors are formatted for the model.
- **SQLRooms** keeps `@deck.gl/json` as its canonical spec, adds a dataset-binding block for
  DuckDB and GeoArrow sources, and ships its own normalizer, validator and AI instructions whose
  rules mirror CARTO's almost line for line.
- pydeck, kepler.gl configurations and noodles.gl project files are further spec-shaped formats
  over the same layers. There are today at least three vocabularies for "a color scale over an
  attribute" and models default to a fourth.

### Silence is the failure mode

`JSONConverter` replaces an unknown `@@type` or `@@function` with `null` and, if a logger is
configured, warns. The map renders without the layer. A wrong accessor becomes `undefined`, a
transparent color, an invisible mark. The documentation says: "Error detection is currently
limited and error messages may not be very helpful." An agent can recover from any error it can
see; it cannot recover from an empty map, and today the empty map is the only signal.

### The loop is write-only

Nothing defined flows back from the rendered map to the program that wrote the spec: no
viewport, no layer counts, no picked object. The 2018 RFC anticipated a transport back-channel;
the `Transport` class still logs "Back-channel not implemented for this transport". Downstream
products either send a lossy hand-written summary of the map or send nothing.

## Proposal

The v2 tracker already lists Zod schemas, generated JSON Schema, LLM-friendly documentation and
data sources. This RFC endorses that list and proposes the target shape and the missing pieces.

### 1. A schema, including the rules that are unwritten today

- Zod schemas per layer, view, effect and widget, generated from the TypeScript prop types where
  possible, and a **schema catalog API** so a registry can publish the schema of exactly what it
  registers: `converter.getJSONSchema()` returns a JSON Schema for the configured classes,
  functions and enumerations.
- The schema must encode the rules that today live in prose: which layer classes accept which
  data or source kinds, required props (`getWeight` for heatmaps, aggregation expressions for
  spatial-index sources), the accessor expression grammar, and enumerated string props.
- With a JSON Schema, agents can use structured output, editors can validate, and a document can
  be checked before it is converted.

### 2. Loud failure: a conversion report

`convert()` keeps its return value and additionally exposes a report, or a strict mode throws:

```ts
const {props, report} = converter.convertWithReport(json);
// report: {
//   ok: boolean,
//   dropped: [{path: 'layers[1]', reason: 'unknown-class', name: 'HexagonLayer',
//              suggestions: ['H3HexagonLayer']}],
//   warnings: [{path: 'layers[0].getFillColor', reason: 'unknown-function', name: 'interpolateColor'}],
//   counts: {layersIn: 2, layersOut: 1}
// }
```

Error text is a prompt: every entry names the legal alternatives. `new JSONConverter({strict:
true})` throws on any drop.

### 3. State read-back

Define a small, serializable read model that any host can return to the author of a spec:

```ts
type DeckJSONState = {
  viewState: Record<string, ViewState>;
  layers: {id: string; type: string; visible: boolean; count?: number; status: 'loading' | 'ready' | 'error'}[];
  lastPick?: {layerId: string; index: number; object?: unknown; coordinate?: number[]};
  screenshot?: string; // data URL, optional and explicit
};
```

`converter.getState(deck)` produces it; a reference MCP App in deck.gl-community renders a spec
and exposes `getState` over the MCP Apps protocol. This finishes the 2018 back-channel with a
consumer that now exists.

### 4. Patch semantics for multi-turn editing

Agents edit maps in turns. Specify how an incremental update applies: JSON Patch
([RFC 6902](https://datatracker.ietf.org/doc/html/rfc6902)) over the document, plus a deck.gl-aware
convenience, deep merge by layer `id` (`mergeSpec(base, patch)`), which is what two downstream
implementations already do independently.

### 5. A data-source concept

A `dataSources` block, declared separately from layers and referenced by id, with a registration
API for adapters (URL, Arrow table, SQL, tiles, COG). The tracker already names SQL; SQLRooms'
dataset registry and CARTO's source functions are two working designs to reconcile. Credentials
stay in the adapter, never in the document.

### 6. Registry profiles

Publish `core` as the reference registry with its schema, and let vendors publish their own
(`@deck.gl/carto`, SQLRooms) as **profiles** that extend it. A document names its profile;
validators and agents load the matching schema. This turns today's closed registries from a
workaround into a supported pattern.

### Two provocations, offered for debate

- Accept Mapbox/MapLibre style-spec expression arrays as an accessor syntax alongside `@@=`.
  Models and humans already speak it, and the style spec is the most widely deployed declarative
  styling language for maps.
- Standardize one color-scale helper vocabulary in core (bins, continuous, categories), rather
  than one per vendor.

## Non-goals

- Replacing the JavaScript API or the "One API" principle for application code. This is a
  profile of the API for programs and agents, and it is explicitly allowed to be smaller and
  stricter than the JavaScript surface.
- Natural-language input. deck.gl does not need to understand prose; it needs to be checkable so
  that a model's fluency in JSON is sufficient.

## Phasing

1. **P0, in deck.gl-community `@deck.gl-community/json`** (the tracker's plan): schemas for
   GeoJSON and base layer props (PR #597), then per-layer schemas and the catalog API; the
   conversion report; LLM-oriented docs and `llms.txt` links.
2. **P1**: state read-back and a reference MCP App; patch semantics.
3. **P2**: data-source declarations with two adapters (URL/Arrow and SQL); the CARTO and SQLRooms
   profiles published against the catalog API.
4. **P3**: upstream into `@deck.gl/json` v2 with deck.gl v10.

CARTO will contribute its production evidence (the 36 KB contract distilled into schema rules,
the empty-map failure catalog, the errors-only feedback design) and engineering time to P0 and P1.

## Open questions

- Keep the `@@` prefixes in v2, or move to plain `type` with a `$schema`? The prefixes are
  unambiguous but barely present in training data; models cope, and a schema makes either work.
- Should `strict` be the default for programmatic use?
- How much of the schema can be generated from TypeScript types versus written by hand?
- Where should profiles live and how are they versioned against deck.gl releases?

## Disclosure

Drafted with an AI coding agent (Claude Code) from the author's research notes and experiments,
and reviewed by the author.
