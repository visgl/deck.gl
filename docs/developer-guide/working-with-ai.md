# Working with AI Coding Agents

AI coding agents write deck.gl fluently, and mostly a version behind. Asked in September 2026
which deck.gl was current, every frontier model answered 9.0 or 9.1; asked to build maps, most
loaded a deck.gl 8 bundle and used 8-era integration patterns. The maps rendered. The code was
old. This page describes a workflow that keeps agents on the version you actually use, first for
application developers, then for contributors to the deck.gl repository.

## Start from local truth

Do not let an agent rely on its memory of deck.gl APIs. Give it the application and ask it to
identify the installed versions first:

```bash
npm ls deck.gl @deck.gl/core @deck.gl/layers @deck.gl/geo-layers @deck.gl/maplibre
```

The installed TypeScript declarations are the authority for constructor props, classes and
types; the website describes the newest release. When a project is pinned to an older release,
point the agent at the documentation for that release and ask it to cite the declaration or page
it used when an API choice is uncertain.

Two facts trip agents up more than any other and are worth stating in the prompt:

- Layers are immutable. Updates mean new layer instances with new props, never mutation.
- MapLibre integration in deck.gl 9.4 is `MapLibreOverlay` from `@deck.gl/maplibre`, attached
  with `map.addControl`. Earlier 9.x releases use `MapboxOverlay` from `@deck.gl/mapbox` for
  MapLibre as well.

## Install the deck.gl skill

The repository contains an Agent Skill that routes version selection, base map integration,
layer and data patterns, declarative JSON and single-page deliverables:

```bash
npx skills add visgl/deck.gl --skill deckgl
```

After installation, ask your agent to use the `deckgl` skill and name the goal, the installed
version, the base map and the observable success condition:

> Use the deckgl skill to add a hexagon aggregation of these points over our MapLibre map.
> Confirm the installed deck.gl version, keep the layer update immutable, open the page in a
> browser, and report console errors and a screenshot with the data visible.

The skill carries procedural judgment and the mistakes we have seen agents make. It does not copy
the API reference into every conversation.

## Give agents exact documentation

The website publishes [llms.txt](https://deck.gl/llms.txt), a curated index of the current
documentation, and a raw Markdown sibling for every page, for example
`https://deck.gl/docs/api-reference/layers/scatterplot-layer.md`. Ask the agent to fetch only
the pages the task needs. `llms.txt` is an inference-time documentation index; it is not crawler
policy or a training opt-out.

## Require an observable verification loop

Typechecking cannot prove that a map renders. Ask the agent to produce evidence in this order:

1. Run the typecheck and relevant tests.
2. Open the actual page in a current browser, not a DOM-only test environment.
3. Capture console messages, page errors and failed network requests. A script URL that returns
   an HTML 404 is the most common reason for an empty map.
4. Capture a screenshot after the data has loaded, and a second one later for animations.
5. Treat "basemap visible, data missing" as a failure and debug from the outside in: scripts
   loaded, `deck` defined, basemap style loaded, layer class registered, data shape matches
   accessors, sizes visible at the current zoom, layer inside the view.

## Working inside the deck.gl repository

Repository contributors should direct the agent to read the root `AGENTS.md` before editing. It
records the setup commands, quality gates, the "ready for merge" checklist and the code style.
Targeted tests do not replace the final `yarn build`, `yarn lint` and `yarn test` gates.
This page describes a workflow; it does not change the contribution policy.
