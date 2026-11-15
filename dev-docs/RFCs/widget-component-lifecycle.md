# POC: Widgets as lifecycle Components

## Goal

Treat a widget instance as a declarative description. Match incoming widgets by `id`,
retain their application state and DOM, and make the incoming instance active, as layers do.
This draft is a proof of concept, not a completed migration of every built-in widget.

## Implemented contract

- `Widget` extends the existing lifecycle `Component`. Default props are inherited,
  props snapshots are frozen, and `clone()` creates an unmounted widget.
- `Component._setProps()` creates a new snapshot and reports a generic prop change reason.
  `Component._compareProps()` uses declared prop equality without layer-specific data,
  attribute, extension, or transition flags. Explicit default ids are respected.
- `widget.setProps(partialProps)` remains supported. It merges into a new snapshot.
  Declarative replacement uses the incoming complete props, so omitted options return
  to defaults. `setProps` overrides can still compare previous and next props.
- Matching uses only `id`, including across constructors. Incompatible widget types must
  use different ids. Duplicate ids warn; the first widget wins, with imperative default
  widgets taking precedence.
- `widget.state` holds persistent mutable application state. `setState()` merges state
  and renders. The internal lifecycle object holds the current widget, deck/manager,
  and root element. Both state objects survive matching.
- `onAdd` runs only when first mounted, and `onRemove` only when removed. Moving between
  views, placements, or external containers preserves the DOM root and state.
- The manager renders a replacement even when its props compare equal, because DOM and
  Preact callbacks may capture the previous instance. Unchanged imperative prop updates
  skip the base HTML render. Explicit state and viewport updates remain renderable.
- Long-lived callbacks use `getCurrentWidget()` to resolve their current owner. It returns
  null after removal. Old props snapshots remain unchanged; old state references remain
  shared, allowing in-flight work to finish against the same state.

## Example

```ts
class CounterWidget extends Widget<WidgetProps> {
  className = 'counter';
  placement = 'top-left' as const;
  state = {count: 0};

  onRenderHTML(element: HTMLElement) {
    element.textContent = String(this.state.count);
    element.onclick = () => this.setState({count: this.state.count + 1});
  }
}

// Each update creates a new active instance, retaining count and the DOM root.
deck.setProps({widgets: [new CounterWidget({id: 'counter'})]});
```

## Representative migrations

- Toggle: persistent checked state and new DOM callbacks after replacement.
- Fullscreen: persistent fullscreen state, current-owner listener dispatch, and exact
  listener removal instead of removing a different bound function.
- Timeline: persistent time/playback/timer handle, current-owner timer dispatch, and
  initial external timeline synchronization at mount rather than construction.

## Remaining work before production

- Migrate persistent instance fields and external callbacks in the remaining widgets
  (including geocoder, stats, theme, selector, splitter, popup/info, and context menu).
  Their arbitrary instance fields are intentionally not copied by the POC.
- Consolidate placement/view props, including imperative relocation and explicit null
  updates, across widget subclasses.
- Complete Preact unmount cleanup across built-ins and audit pending asynchronous work.
- Decide whether to expose generic change flags/update hooks and a typed state parameter.
  The POC keeps the existing lifecycle hooks and adds no layer/GPU machinery.
- Validate all widgets and React integration with repeated replacement, and complete
  public documentation, release notes, migration guidance, and merge-readiness gates.
- Async prop declarations are outside this POC; the generic Component helpers do not
  introduce a new widget async-loading lifecycle.
