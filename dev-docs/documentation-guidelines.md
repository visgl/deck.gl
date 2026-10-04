# Documentation Guidelines

An evolving set of guidelines for writing the deck.gl documentation in `docs/`.

Most readers arrive at a page with a goal and some background: they have used MapLibre, drawn in Figma, made maps in QGIS, or written WebGL. A page should get them from that background to working code. It should describe how deck.gl behaves today, in the words they already use, and say each thing once.

These guidelines apply to all documentation, whether it was typed by hand or drafted with the help of a tool.


## Structure

API reference pages for layers and extensions share one outline. The intro, demo and usage example go directly under the page title, without their own headings. The sections after them are `##` headings: keep them as they are and in this order, and leave out the ones that do not apply.

* **Title and intro** - One or two sentences on what the class does and which layers it works with.
* **Demo** - An embedded demo (see [Demos and figures](#demos-and-figures)).
* **Usage example** - A short code example with the recommended settings.
* **Installation** - The standard npm and script tag block.
* **Constructor** - One bullet per option (extensions only).
* **Properties** / **Layer Properties** - One `####` entry per prop.
* **Remarks** - Actionable guidance that does not belong to a single prop. Use `###` subsections when there is more than one topic.
* **Limitations** - What does not work, as a list. If there is only one limitation, it can go in Remarks instead.
* **Source** - A link to the source directory.

Developer guide pages are organized around a task (e.g. "Loading data", "Using with GlobeView") and do not need to follow this outline.


## Guidelines

### Voice

* Say what something does, then when to use it. From [`PathLayer`](../docs/api-reference/layers/path-layer.md#billboard): "If `true`, extrude the path in screen space (width always faces the camera)."
* One idea per sentence. If a sentence needs a semicolon and two qualifying clauses, split it or drop the clauses.
* Use the words the reader already knows: "where the pattern starts over", not "phase domain"; "screen pixels", not "nominal zoom-stable projected pixels". Introduce a deck.gl term only when the reader needs it to read other pages, and link to where it is defined.
* Use the present tense. Write "draws", not "will draw".
* Give a concrete number when explaining units: "`[4, 5]` on a 10 pixel wide path draws 20 pixel dashes separated by 25 pixel gaps."
* Pick one or two examples instead of listing every synonym. "Routes and GPS traces" reads better than "routes, GPS traces, railway alignments, and XYZ trajectories".
* Do not describe how good the feature is. Words like "powerful", "robust", "seamless" or "simply" do not help the reader.
* Do not use bold lead-ins in bullet lists, except for the symptom in a troubleshooting entry.

### Properties

Follow the existing format:

```md
#### `dashUnits` (string, optional) {#dashunits}

* Default: `'widths'`

The units of `getDashArray`:
...
```

* Start with one sentence on what the prop controls. Put units, ranges and the effect of each value next.
* Describe accessors with the standard bullets: "If a number is provided, it is used as the ... for all objects." and "If a function is provided, it is called on each object to retrieve its ...".
* Mention a limitation on the prop itself only if it changes how the prop is used, e.g. "Only applies to `PathLayer` and its composites." Collect the rest under Limitations.
* Keep implementation detail out: shader defines, attribute names, CPU passes and coverage math belong in the source and the RFCs. Performance costs are the exception, stated as what the user pays: "uses one more vertex attribute".
* Keep the TSDoc comment and the first sentence of the docs entry in agreement.

### Code examples

* Show only the props relevant to the page and use `// ...` for the rest.
* Mark the props a class adds, e.g. `// props added by PathStyleExtension`, as in [`FillStyleExtension`](../docs/api-reference/extensions/fill-style-extension.md).
* Use the settings you would recommend, not the defaults kept for compatibility.
* Prefer real-looking data (`d => d.path`, `[-122.45, 37.78]`) over placeholders like `foo`.

### Remarks and Limitations

Remarks collects what a reader should know that does not fit under one prop. Common topics are:

* Using the class with a particular view or integration, e.g. "Using with GlobeView" in [`PathLayer`](../docs/api-reference/layers/path-layer.md#using-with-globeview) or "Antialiasing" in [`MapboxOverlay`](../docs/api-reference/mapbox/mapbox-overlay.md).
* Precision and performance trade-offs, e.g. "Filter precision" in [`DataFilterExtension`](../docs/api-reference/extensions/data-filter-extension.md#filter-precision).
* How-to recipes, e.g. "Use web fonts" in [`TextLayer`](../docs/api-reference/layers/text-layer.md).
* Behavior that applies across props, e.g. "Polygons are always closed" in [`PolygonLayer`](../docs/api-reference/layers/polygon-layer.md).
* Choosing between options, e.g. "Choosing a dash mode".
* A short "Coming from ..." table when readers bring expectations from another library. List only what deck.gl supports, then call out the two or three differences that cause most surprises.
* Troubleshooting, written as the symptom, the cause in one sentence, and the fix: "**A dashed line draws solid.** ... Use `dashMode: 'path'`."

A short page can use a list of bullets instead of subsections.

Do not use Remarks to announce new or changed support (e.g. "now supports X"); put that in `docs/whats-new.md`.

Limitations lists what does not work: unsupported layers, devices or views, and hardware limits. Keep each entry to one or two sentences, and link to the issue or RFC if a fix is planned.

### Demos and figures

* Prefer an interactive demo when the reader would want to change a value and see the result. Doc demos live in `website/src/doc-demos/` and are imported into the page, e.g. `ToggleWidgetDemo` in [`ToggleWidget`](../docs/api-reference/widgets/toggle-widget.md).
* Use a static figure when there is nothing to change, such as a diagram of how views are laid out.
* Host images in [visgl/deck.gl-data](https://github.com/visgl/deck.gl-data), not in this repository.
* Put titles and captions in the Markdown, not in the image. Label every row or panel.
* Show one variable per figure. Check that it reads on both the light and dark site themes.
* Do not use before/after images of bug fixes or render test output in reference pages. Those belong in the PR, the issue or `docs/whats-new.md`.

### Where content goes

* **API reference** - How the API behaves now. Avoid "now", "new in", "fixed" and version history, apart from a `from vX.Y` badge or a short deprecation note.
* **`docs/whats-new.md`** - One bullet per feature, linking to the reference.
* **`docs/upgrade-guide.md`** - Breaking changes, removals and deprecations, each with before and after code.
* **`dev-docs/RFCs/`** - Design rationale, alternatives, internals and future work.
* **Release tracker issue** - Planned breaking changes. The reference page mentions them in one sentence and links to the tracker instead of listing them.

Say each fact once, in the place it belongs, and link to it from elsewhere.


## Examples

* [`PathLayer`](../docs/api-reference/layers/path-layer.md) - Short, single-purpose prop entries. "Using with GlobeView" under Remarks states the problem, then gives the code that fixes it.
* [`DataFilterExtension`](../docs/api-reference/extensions/data-filter-extension.md) - "Filter precision" explains a limitation, gives a workaround in code and says when it can be ignored. Limitations is a plain list.
* [`FillStyleExtension`](../docs/api-reference/extensions/fill-style-extension.md) - The usage example separates the layer's own props from the props the extension adds.
* [`ToggleWidget`](../docs/api-reference/widgets/toggle-widget.md) - An embedded demo above a one sentence intro and a code example.


## Before and after

The following are passages rewritten to demonstrate the guidelines.

### Implementation vocabulary

Before:

> * `dashMode` (string) - select the phase domain, one of `'segment'` and `'path'`. Supplying either value enables dashing. If omitted, the phase mode still defaults to `'segment'`, but dashing remains disabled unless `dash: true` or the deprecated `highPrecisionDash: true` is supplied.

After:

> * `dashMode` (string) - where the dash pattern starts over. `'segment'` restarts it at every vertex; `'path'` runs it continuously along the whole path. Setting `dashMode` also enables `dash`. Default `'segment'`.

### Hedged units

Before:

> - **`'pixels'`: the dash is a screen-space symbol.** One unit is one nominal zoom-stable projected pixel. This is exact for flat or orthographic paths and approximate under pitch, perspective, or elevation.

After:

> * `'pixels'` - screen pixels. Dashes keep their size on screen as you zoom. Approximate when the view is pitched.

### Release history in a reference page

Before:

> | Billboarded dashes **differ from flat ones** or render solid | The along-path coordinate used different units in the two extrusion branches | Fixed automatically in v9.4 |

After: removed from the reference page. `docs/whats-new.md` already says dashes render consistently on billboarded paths.


## Notes for AI coding assistants

When writing or editing documentation, follow the guidelines above. In addition:

* Read two or three other pages in the same folder before writing, and match their structure and phrasing.
* Do not copy text from RFCs, PR descriptions or code comments into the docs. Rewrite it for someone who has not read them.
* Check each claim about behavior, defaults and units against the source.
* When comparing to another library or tool, check that library's documentation rather than relying on memory.
* Keep `docs/whats-new.md` and `docs/upgrade-guide.md` entries to the length of their neighbors.
