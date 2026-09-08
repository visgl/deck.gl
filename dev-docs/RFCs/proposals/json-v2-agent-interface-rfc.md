# RFC: `@deck.gl/json` v2 as an interface for programs and AI agents

- **Authors**: Javier de la Torre (CARTO)
- **Date**: Sep 8, 2026
- **Status**: Draft
- **Related**: [JSON Layers RFC (v6.1, 2018)](../v6.1/json-layers-rfc.md) ·
  [`@deck.gl/json` v2 tracker, deck.gl-community #596](https://github.com/visgl/deck.gl-community/issues/596) ·
  [Step 1: Zod schemas for GeoJSON, deck.gl-community #597](https://github.com/visgl/deck.gl-community/pull/597)

Summary: AI agents are becoming a frequent author of deck.gl maps, and the format they reach for is
the declarative JSON this project designed in 2018 for generating visualizations "from the backend
without having knowledge about how to code front-end applications". Several products now build on
`@deck.gl/json` independently and have each rebuilt the same missing pieces: a schema, a way to
learn what failed, a way to read the rendered map back, a way to edit it incrementally, and a way
to declare data sources. The v2 tracker in deck.gl-community already plans most of this. This RFC
builds on that plan, adds production evidence for it, and proposes a target shape for the items
on it so they can be reviewed before code is written.

## Prior art

- The 2018 RFC's *Future Work* section already lists **JSON Schemas** (publish a schema, generate
  it from prop types, publish per version) and rates **Layer Prop Validation** as P0. Neither has
  landed. This RFC is largely a request to finish that list for a consumer that now exists.
- [#596](https://github.com/visgl/deck.gl-community/issues/596) (Ib Green, April 2026) plans a
  `@deck.gl-community/json` module with Zod schemas, generated JSON Schema, LLM-friendly
  documentation and SQL data sources, to be upstreamed once proven.
  [#597](https://github.com/visgl/deck.gl-community/pull/597) is its first step.
- In the #596 discussion, @dzole0311 proposed a schema/catalog API, shared schemas for base layer
  props, views, accessors, colors and data bindings, and a split between the visualization spec
  and data-source declarations; @ilyabo asked for GeoArrow layers and for data to be passed
  separately from the layer spec. Proposals 1 and 5 below restate those points; this RFC supports
  them and adds the evidence behind them.
- `@deck.gl/json`'s `Transport` base class (`modules/json/src/transports/transport.ts`) leaves
  `sendJSONMessage` and `sendBinaryMessage` unimplemented outside the Jupyter integration, so
  browser hosts have no defined return path from a rendered map to the program that wrote the spec.

## Motivation

### Agents already write deck.gl JSON, and mostly get it right

In experiments run for the Open Visualization Summit (prompts, raw outputs and harnesses in
[jatorre/deckgl-ai-ready](https://github.com/jatorre/deckgl-ai-ready)), seven current frontier
models were asked, without tools or documentation, to write a `@deck.gl/json` choropleth. All
seven produced `@@type`, views and initial view state correctly. Every failure was in one place,
the data-driven accessor:

| Outcome | Models |
| --- | --- |
| Valid `@@=` expression | 4 of 7 |
| A helper that exists only in one vendor's registry | 1 of 7 |
| An invented helper (`interpolateColor`, `quantileColorScale`) | 2 of 7 |
| Produces an error the calling program can observe | 0 of 7 |

The converter warns to the console (`log` defaults to `console`) and substitutes `null`; nothing is
returned to the caller. The format is learnable; the vocabulary outside the format is not, and the
runtime does not tell the author when a guess was wrong.

### Downstream users have rebuilt the same pieces

- CARTO renders agent-written `@deck.gl/json` inside chat clients (an MCP App), using the stock
  converter with a closed registry of CARTO layers and credential-injecting source functions. To
  make a model write a valid spec it ships a large instruction document, a substantial part of
  which enumerates cases that yield an empty map with no error: unregistered layer, wrong
  layer-to-source pairing, missing aggregation expression, unsupported expression. It detects
  drops by counting layers before and after conversion. In the same service, chart specs are
  validated against a published JSON Schema and the errors are returned to the model.
- SQLRooms keeps `@deck.gl/json` as its canonical spec, adds a dataset-binding block for DuckDB
  and GeoArrow sources, and ships its own normalizer, validator and AI instructions with rules
  that largely mirror CARTO's.
- pydeck, kepler.gl configurations and noodles.gl project files are further spec-shaped formats
  over the same layers. There are today at least three vocabularies for "a color scale over an
  attribute", and models default to a fourth, Mapbox style-spec expressions.

### Silence is the failure mode

`JSONConverter` replaces an unknown `@@type` or `@@function` with `null` and warns. The map renders
without the layer. A wrong accessor becomes `undefined`, a transparent color, an invisible mark.
The module documentation says "Error detection is currently limited and error messages may not be
very helpful." A program can recover from any error it can observe; it cannot recover from an
empty map.

## Proposal

### 1. A schema, including the rules that are unwritten today

Zod schemas per layer, view, effect and widget, generated from TypeScript prop types where
possible, plus a **catalog API** so that a registry can publish the schema of exactly what it
registers: `configuration.getJSONSchema()` returns a JSON Schema for the configured classes,
functions and enumerations.

The schema must also carry the rules that live in prose today: which layer classes accept which
data or source kinds, required props (a weight accessor for heatmaps, an aggregation expression for
spatial-index sources), the accessor expression grammar, and enumerated string props.

This requires the class catalog to carry schemas alongside constructors, or a convention for
deriving them from `defaultProps`; either is a change to the shape of `JSONConfiguration` and
needs its own compatibility story (see below). With a JSON Schema, agents can use structured
output, editors can validate, and a document can be checked before it is converted.

### 2. Loud failure: a conversion report

Conversion keeps its current return value and additionally exposes a report. A strict mode
throws on the first drop.

```ts
const configuration = new JSONConfiguration({...catalogs, strict: false});
const converter = new JSONConverter({configuration});
const {props, report} = converter.convertWithReport(json);
// report: {
//   ok: boolean,
//   dropped: [{path: 'layers[1]', reason: 'unknown-class', name: 'HexagonLayer',
//              suggestions: ['H3HexagonLayer']}],
//   warnings: [{path: 'layers[0].getFillColor', reason: 'unknown-function', name: 'interpolateColor'}],
//   counts: {layersIn: 2, layersOut: 1}
// }
```

Two implementation constraints follow from the current design: `strict` and the report collector
must live on `JSONConfiguration`, because `convertJSON()` clones the configuration and the recursive
helpers see nothing else; and the report must be cached alongside `convertedJson`, since
`convert()` returns the cached result when the same JSON object is passed again.

Every report entry names the legal alternatives; for a program, error text is the next prompt.

### 3. State read-back

A small, serializable read model that any host can return to the author of a spec, produced by a
free function rather than by the converter (the converter is a pure JSON-to-props transform and
holds no reference to a `Deck`):

```ts
type DeckJSONState = {
  viewState: Record<string, ViewState>;
  layers: {id: string; type: string; visible: boolean; count?: number; status: 'loading' | 'ready' | 'error'}[];
  lastPick?: {layerId: string; index: number; object?: unknown; coordinate?: number[]};
  screenshot?: string; // data URL, optional and explicit
};

function getDeckJSONState(deck: Deck): DeckJSONState;
```

A reference MCP App in deck.gl-community would render a spec and expose this state over the MCP
Apps protocol, giving the `Transport` back-channel a browser-side consumer.

### 4. Patch semantics for multi-turn editing

Programs and agents edit maps in turns. Specify how an incremental update applies: JSON Patch
([RFC 6902](https://datatracker.ietf.org/doc/html/rfc6902)) over the document, plus a deck.gl-aware
convenience, deep merge by layer `id` (`mergeSpec(base, patch)`), which two downstream
implementations already do independently.

### 5. A data-source concept

A `dataSources` block, declared separately from layers and referenced by id, with a registration
API for adapters (URL, Arrow table, SQL, tiles, COG), as already proposed on #596. SQLRooms'
dataset registry and CARTO's source functions are two working designs to reconcile. Credentials
stay in the adapter, never in the document.

### 6. Registry profiles

Publish `core` as the reference registry with its schema, and let vendors publish theirs as
**profiles** that extend it. A document names its profile; validators and agents load the matching
schema. This turns today's closed registries from a workaround into a supported pattern.

## The "One API" question

The 2018 RFC asked that JSON remain a natural mirror of the JavaScript API with no special
semantics. This RFC does not change the mapping of props, but it does propose that a registry may
be **smaller and stricter** than the JavaScript surface: a profile registers a subset of layers and
functions and publishes a schema for exactly that subset. Every production user surveyed already
does this; the question for the TSC is whether to make it a supported pattern or to keep it outside
the project. The authors believe a supported pattern with published schemas serves "One API" better
than the current situation, where each vendor's subset is implicit.

## Alternatives considered

- **Do nothing upstream; let each vendor validate.** This is the status quo. It produces divergent
  vocabularies and no shared schema for tooling or agents to target.
- **Generated code instead of a document.** Agents can emit JavaScript. It is heavier to sandbox,
  harder to diff and patch, and not portable across hosts; the document approach keeps the
  application in control of what is rendered.
- **Imperative tool APIs (verbs) instead of a document.** Workable for a single application, and
  used in production, but every rule ends up in prose and is written once per host.
- **Adopt another schema (Vega-Lite style) for maps.** The module documentation is explicit that
  `@deck.gl/json` is not an implementation of alternate schemas; this RFC stays within the existing
  format.

## Compatibility and migration

- Documents valid today remain valid. The report and `strict` are additive; the default stays
  non-strict.
- The schema is additive metadata on the catalog. Registrations without schemas continue to work
  and are reported as "unschematized" by `getJSONSchema()`.
- Patch semantics and `dataSources` are new, opt-in document sections; a converter that does not
  know them should report them as unknown keys rather than ignore them.
- The v2 module incubates in deck.gl-community per #596 and is proposed for upstreaming into
  `@deck.gl/json` only once used in production.

## Limitations

- A schema cannot express every runtime constraint (data shape at render time, tile availability).
  The report and read-back exist because validation alone cannot prove that a map rendered.
- State read-back that includes feature counts or screenshots has a cost; both are optional and
  explicit.

## Phasing

1. **P0, deck.gl-community `@deck.gl-community/json`** (the tracker's plan): schemas for GeoJSON
   and base layer props (#597), then per-layer schemas and the catalog API; the conversion report;
   documentation for programs and agents.
2. **P1**: state read-back and a reference MCP App; patch semantics.
3. **P2**: data-source declarations with two adapters (URL/Arrow and SQL); the CARTO and SQLRooms
   profiles published against the catalog API.
4. **P3**: upstream into `@deck.gl/json` v2 in a future deck.gl major.

## Open questions

- Should `@deck.gl/json` accept Mapbox/MapLibre style-spec expression arrays as an accessor
  syntax alongside `@@=`? Many authors already know that grammar, but the module's documentation
  states it is not an implementation of alternate schemas, and "One API" argues against it.
- Should core define one color-scale helper vocabulary (bins, continuous, categories) so vendors
  and documents converge, or leave scales to profiles?
- Keep the `@@` prefixes in v2, or move to plain `type` with a `$schema`? A schema makes either
  work; the prefixes are unambiguous but rare in training data.
- Should `strict` be the default for programmatic use?
- How much of the schema can be generated from TypeScript types versus written by hand?
- Where should profiles live and how are they versioned against deck.gl releases?

## Disclosure

Drafted with an AI coding agent (Claude Code) from the author's research notes and experiments,
revised after an independent review, and reviewed by the author.
