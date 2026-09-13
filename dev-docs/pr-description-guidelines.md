# Pull Request Description Guidelines

An evolving set of guidelines for writing pull request descriptions in deck.gl. They are based on
the descriptions maintainers have written since 2016, and on the ones that needed a lot of back and
forth in review.

The description is what a reviewer reads before the diff. It should tell them what problem the PR
solves and what they are about to see, so that they can spend their time on the code. After the PR
is merged, the description and the linked issue are the main record of why a change was made.

These guidelines apply to all PRs, whether the description was typed by hand or drafted with the
help of a tool. Maintainers may ask for the description to be rewritten before reviewing, and may
close a PR whose description does not follow these guidelines.


## Structure

The PR template has three parts. Keep the headings as they are (`####` level) and do not add other
sections unless one of the optional ones below applies.

* **Issue reference** - The first line links the issue or PR this change relates to. Use
  `Closes #123` if the PR fully resolves the issue and `For #123` if it only partially resolves it.
  Other common forms are `Follow up of #123` and `Requires https://github.com/visgl/luma.gl/pull/456`.
  If there is no issue, remove the line. Do not leave `Closes #` without a number.
* **Background** (optional) - One to three sentences on what is wrong or missing today and how
  this PR addresses it. If the linked issue already explains this, remove the section.
* **Change List** - A list of the changes in this PR, one bullet per module, class, API or
  artifact. This section is required.

Optional additions:

* **Screenshot or GIF** - If the change is visual, add a before/after image next to the text that
  describes the change, with a short caption on what to look for.
* **TODO** - If some work is intentionally left for a follow up PR, list it under a `#### TODO`
  heading.
* **Questions** - Open design questions for the reviewers, e.g. under `#### Questions`.

Most good descriptions are between 300 and 900 characters. The length should depend on how much of
the reasoning is new to the reviewer, not on the size of the diff. A large mechanical change (e.g.
a TypeScript migration) may only need a few bullets, while a one line shader fix may need a
paragraph if the cause is not obvious.


## Guidelines

### Issue reference

* Link to the issue, RFC or PR that motivates the change instead of repeating its content. If the
  bug was demonstrated in a review comment, link to that comment.
* When fixing a regression, name the PR that introduced it, e.g. `Introduced by #7513`.
* When the PR depends on a change in another vis.gl repo, say so on the first line, e.g.
  `Requires https://github.com/visgl/luma.gl/pull/1268`.

### Background

* Describe the current behavior first, then the problem it causes. From #4645: "Currently the
  `TileLayer` sends requests for every tile it sees, regardless of if it's currently outside the
  viewport. This is inefficient and causes an inordinate number of requests."
* Use the present tense and stay concrete. Quote the error message, the shader function or the
  line of code involved when it helps the reviewer find the right place in the diff.
* Do not describe how good the solution is. Words like "comprehensive", "robust" or "clean" do
  not help the reviewer.
* If the reasoning is long, e.g. a performance analysis or a comparison of alternatives, it is fine
  to add a subheading such as `#### Performance` or `#### Cause`. Keep it at the `####` level.

### Change List

* One bullet per change. Start with a verb or with the name of the thing that changed, e.g.
  ``Add `stepMode` to attribute settings`` or `` `TileLayer`: sub layer visibility handling``.
* Put code identifiers in backticks. Do not end bullets with a period.
* Include the changes a reviewer might otherwise question: updated golden images (and why they
  changed), removed workarounds, changed timeouts, deleted or skipped tests.
* A breaking change is a bullet like any other. Put the reasoning and the expected impact as
  sub-bullets under it, and add an `Upgrade guide` bullet. See #8858.
* The last bullets are usually `Unit tests`, `Render tests`, `Documentation` and `Upgrade guide`,
  as applicable.
* Do not list files. The diff already does that.

### Testing

* Say how the change was verified in one line, either as a bullet in the Change List or as a
  sentence at the end, e.g. "Verified in layer browser." or "Tested ScreenGridLayer example on
  Chrome, Safari and Firefox."
* If several workflows were exercised, a short list under `#### Tested Workflows` works well.
  See #8460.
* Do not add checkboxes for the reviewer to tick. Verifying the change is the author's job.

### Scope

* Say what is left out on purpose, e.g. "Tests will be in the next PR." or "This PR just moves
  code around. Functional changes will come in future PRs."
* When splitting a large change into several PRs, number them in the title, e.g.
  `TerrainExtension (1/3)`. Put the overall goals and the list of planned PRs in the first one. The
  following PRs only need the issue reference and their own Change List.
* If you are unsure about part of the design, ask in the description. Reviewers can answer a
  question much faster than they can guess what you were unsure about.

### Things to leave out

* Restating the title.
* `Summary`, `Test plan`, `Validation`, `Impact` or `Goal` sections. The template headings cover
  the same ground.
* Tables listing each file and what changed in it.
* Emoji, footers, links to tool sessions, and summaries generated by review bots.
* Notes about which branches were merged into which. Git records this already.


## Examples

The PRs below were written by people between 2016 and 2024. Quotes are abbreviated; follow the
links for the full text.

### Bug fixes

* [#7092](https://github.com/visgl/deck.gl/pull/7092) Fix arcgis integration (2022) - Shows the
  line that regressed before and after, names the integration that relied on the old behavior, and
  has a single bullet in the Change List.

  > For #7081
  >
  > This is a regression due to a change in `redraw` from
  >
  > ```js
  > const redrawReason = reason || this.needsRedraw({clearRedrawFlags: true});
  > ```
  >
  > to
  >
  > ```js
  > const redrawReason = this.needsRedraw({clearRedrawFlags: true}) || reason;
  > ```
  >
  > The intention is to always clear the dirty flags when redraw is forced by the user. However,
  > this changed the `reason` received by `_customRender`, which the ArcGIS integration is relying
  > on.
  >
  > #### Change List
  > - `redraw` always invoke `_customRender` with user-supplied reason, if any

* [#1317](https://github.com/visgl/deck.gl/pull/1317) Fix lighting bugs with custom coordinate
  system and model matrix (2018) - Lists the bugs, gives the author's opinion on how lighting
  should work as sub-bullets, and ends with "Verified in layer browser."
* [#2230](https://github.com/visgl/deck.gl/pull/2230) Fix offset projection under offset modes
  (2018) - A longer diagnosis under `### Background`, `### Cause` and `### Change List`, with the
  open design question asked in the description.
* [#6224](https://github.com/visgl/deck.gl/pull/6224) Re-instate previous GL state after
  animationLoop.onRender (2021) - Quotes the GL calls involved and includes the trace that shows
  where they are issued.

### Visual changes

* [#2147](https://github.com/visgl/deck.gl/pull/2147) Wrap longitudes over the 180th meridian
  (2018)

  > For https://github.com/uber/deck.gl/issues/2051
  >
  > Before:
  > ![wrapping-1](...)
  >
  > After:
  > ![wrapping-0](...)
  >
  > #### Change List
  > - By default, wrap longitude around the viewport center.
  > - Add a `wrapCoordinates` prop to layers. If set to `false`, fallback to the old projection behavior.

* [#4117](https://github.com/visgl/deck.gl/pull/4117) Non-Geospatial Tiling Usage (2020) -
  Before/after screenshots from an outside contributor, with the fix that caused the difference
  explained in the Change List.
* [#9201](https://github.com/visgl/deck.gl/pull/9201) Match GlobeView projection parameters with
  Maplibre v5 (2024) - One screenshot with a one line caption ("Grid lines are rendered by
  Maplibre, points are rendered by deck.gl."), and a bullet explaining why golden images changed.

### New features

* [#5460](https://github.com/visgl/deck.gl/pull/5460) Add background rendering to TextLayer (2021)

  > For #4579
  >
  > This PR adds a "background" sublayer to the TextLayer. This allows for:
  >
  > - Padding
  > - Per-object background color, border color, and border width
  > - (Advanced user) custom styling via `_subLayerProps` and custom layer
  >
  > With `background: false`, the feature has no impact on perf. With `background: true` (as well
  > as legacy `backgroundColor` users) there is more overhead in attribute generation, in exchange
  > for the additional flexibility.
  >
  > #### Change List
  > - Deprecate `backgroundColor` prop, add `background`, `backgroundPadding`, `getBackgroundColor`, `getBorderColor`, `getBorderWidth`
  > - Documentation
  > - Upgrade Guide
  > - Render test

* [#3721](https://github.com/visgl/deck.gl/pull/3721) Picking 3D point (2019) - Explains the new
  render pass in two paragraphs and justifies its cost under `#### Performance`.
* [#8024](https://github.com/visgl/deck.gl/pull/8024) add(widgets) fullscreen widget (2023) -
  Shows the API as a code block and lists design goals before the Change List.
* [#4838](https://github.com/visgl/deck.gl/pull/4838) Ability to abort ongoing tile requests if
  there are too many (2020) - From an outside contributor. Each bullet links the reference that
  justifies it, followed by a `#### Demo` GIF with a paragraph on what to notice.

### Breaking changes

* [#8858](https://github.com/visgl/deck.gl/pull/8858) Explicitly set stepMode in Attribute layout
  (2024)

  > - Remove `divisor` from attribute and shader attribute settings. While this is a breaking change,
  >   + Setting it does nothing as of v9.0
  >   + Moving forward, we won't be able to make it work exactly like v8, due to luma API changes
  >   + Most custom layers use `AttributeManager.add` and `AttributeManager.addInstanced` instead of explicitly setting `divisor`, so the impact will be low
  > - Add `stepMode` to attribute settings
  > ...
  > - Documentation and upgrade guide

* [#5798](https://github.com/visgl/deck.gl/pull/5798) Fix size projection in billboard mode
  (2021) - Lists the exact layers affected by a visual breaking change.
* [#7694](https://github.com/visgl/deck.gl/pull/7694) TextLayer scaling consistency (2023) - A
  longer Background for a breaking change whose reasoning is not obvious.

### Refactors and multi-part changes

* [#1578](https://github.com/visgl/deck.gl/pull/1578) Partial Updates #2: Split out `Attribute`
  class from `AttributeManager` (2018)

  > #### Background
  > - The `AttributeManager` was getting complex, we have a number of planned changes, and also it was clear that we needed a stronger abstraction for the "attribute descriptors" ...
  > - This PR just moves code around. Functional changes will come in future PRs.
  >
  > #### Change List
  > - Splits out a new `Attribute` class from `AttributeManager`
  > - Add trivial tests to new class.
  > - No change in functionality or APIs intended (to minimize burden on reviewers).

* [#5820](https://github.com/visgl/deck.gl/pull/5820) Allow CompositeLayer to filter sub layers
  during redraw (2021) - Two sentences and two bullets.
* [#8886](https://github.com/visgl/deck.gl/pull/8886) GPU Aggregation (1/8): Aggregator and
  AggregationLayer (2024) - Goals as bullets, the eight planned PRs as a list, then only this PR's
  Change List. The following parts are each a few lines long.
* [#7604](https://github.com/visgl/deck.gl/pull/7604), [#7605](https://github.com/visgl/deck.gl/pull/7605),
  [#7608](https://github.com/visgl/deck.gl/pull/7608) TerrainExtension (1/3) to (3/3) (2023) - Part
  2 reads "See docs for API review. Tests will be in the next PR." followed by three bullets.

### Performance

* [#7513](https://github.com/visgl/deck.gl/pull/7513) Handle defaultProps of extensions (2022) -
  Two paragraphs of before and after behavior, a benchmark table, and "My main concern about
  merging this is the perf impact."
* [#3906](https://github.com/visgl/deck.gl/pull/3906) Optimize (2019) - Separates the numbers for
  this PR from the cumulative numbers since the last release.
* [#4388](https://github.com/visgl/deck.gl/pull/4388) Fix polygon offset calculation in TileLayer
  (2020) - Before and after tables of the values that changed.

### Chores, docs and infrastructure

* [#8460](https://github.com/visgl/deck.gl/pull/8460) Move to ESM modules (2024)

  > #### Tested Workflows
  > - Bootstrap
  > - Build
  >   + ESM entry (`import('@deck.gl/core')`)
  >   + CJS entry (`require('@deck.gl/core')`)
  >   + Script bundle
  > - Lint
  > - Examples start-local
  > - Test
  >   + node
  >   + browser-headless
  >
  > #### TODO
  > - The following modules do not build: `arcgis`, `test-utils` due to TypeScript errors, will address in future PRs

* [#2426](https://github.com/visgl/deck.gl/pull/2426) Add release branch update script (2018) -
  The whole description is the command and the three things it updates.
* [#7029](https://github.com/visgl/deck.gl/pull/7029) [mapbox] documentations (2022) - One issue
  reference and two bullets, one of which explains why a usage pattern is being removed from the
  docs.
* [#1978](https://github.com/visgl/deck.gl/pull/1978) Update React docs (2018) - Issue reference,
  "Follow up of #1971", three bullets.

### Asking questions and stating scope

* [#4645](https://github.com/visgl/deck.gl/pull/4645) TileLayer Request scheduler (2020) - Three
  design questions under `#### Questions/Notes`.
* [#2685](https://github.com/visgl/deck.gl/pull/2685) Mat4 model transform attribute for mesh
  layer (2019) - Asks the reviewers whether an RFC is needed and proposes an alternative API in the
  description.
* [#3530](https://github.com/visgl/deck.gl/pull/3530) attribute spring transition (2019) - Has a
  section titled "Work _not_ implemented in this PR" and links the follow up issue.


## Before and after

The following are descriptions with problems rewritten to demonstrate how to fix them.

### Empty template

A fix for a published package that imported from `src/`.

Before:

> Closes #1234
> #### Background
>
> #### Change List
> -

After:

> Closes #1234
>
> The published `@deck.gl/widgets` bundle imports from `src/`, so applications that do not
> transpile `node_modules` fail to resolve the module.
>
> #### Change List
> - Import from the package entry point instead of `src/`

### Restating the title

A change to the blend and depth parameters used by interleaved basemap rendering.

Before:

> ## Summary
> - initialize interleaved overlays with the interleaved default parameters so depth and blending align with expectations
>
> ## Testing
> - not run (not requested)

After:

> Closes #1234
>
> `MapboxOverlay` in interleaved mode is created with the standalone `Deck` defaults
> (`depthTest: false`), so deck layers are drawn over basemap buildings.
>
> #### Change List
> - `MapboxOverlay`: pass interleaved default parameters (`depthTest: true`, premultiplied blend) when constructing the `Deck`
> - Render test for interleaved overlay against a 3D basemap layer

### Sections without content

A release notes update.

Before:

> ## Summary
> - Expand docs/whats-new.md with 9.4 highlights
>
> ## Test plan
> - [ ] Review prose for accuracy
> - [ ] Website builds cleanly
>
> 🤖 Generated with ...

After:

> For #1234
>
> #### Change List
> - `docs/whats-new.md`: 9.4 highlights for Controllers, GlobeView, Geo Layers, Performance
>
> Preview: https://<user>.github.io/deck.gl/docs/whats-new

### Too long

Part 2 of a six PR series fixing dash alignment in `PathStyleExtension`. The original was about
7,000 characters: a paragraph on which branches had been merged where, a section explaining how to
read the image diffs using an analogy, a table listing every file, and a checklist of validation
steps.

After:

> For #1234. Part 2 of 6, follows #1233.
>
> Dash phase is computed in a space that stretches when a path is billboarded, elevated or offset,
> so dashes bunch up or stretch along tilted or widened segments.
>
> #### Change List
> - `PathStyleExtension`: measure dash distance along the path in common space, before billboarding and offset are applied
> - Golden images for `path-dash-*` updated: dash spacing is now uniform along tilted segments (left old, right new below)
> - Unit tests
>
> ![before-after](...)
>
> #### TODO
> - Justified dashes (part 3)


## Notes for AI coding assistants

When drafting a PR description for a contributor, follow the guidelines above. In addition:

* Use the headings from the PR template as they are. Do not add `Summary`, `Test plan`,
  `Validation`, `Impact`, `Goal` or `Motivation` sections. Testing goes in the Change List or in
  one sentence at the end.
* Keep the description under 900 characters unless the cause or the design is genuinely hard to
  explain.
* Do not add footers, emoji, links to tool sessions, `Co-Authored-By` lines, or a table of files.
* Do not include the authorship declaration from the template. The contributor decides what to
  disclose. See the "AI-assisted contributions" section of `CONTRIBUTING.md`.
* Do not make up an issue number. If the issue is not known, leave `Closes #` for the contributor
  to fill in.
* When golden images change, say which ones and why in the Change List.
