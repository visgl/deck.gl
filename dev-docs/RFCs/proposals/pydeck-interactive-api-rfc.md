# RFC: pydeck interaction API

* **Authors**: Andrew Duberstein (@ajduberstein), Ib Green (@ibgreen)
* **Date**: January 26, 2020
* **Status**: Draft

References:
- [deck.gl Transport protocol](https://docs.google.com/presentation/d/1fzSHJxstSfNQe8VCtLLZvQ8D3OuJAfS7_LqPg0QPPvc)
- [ipywidgets.observe()](https://ipywidgets.readthedocs.io/en/latest/examples/Widget%20Events.html)
- [pydeck example: reading back selection](https://github.com/visgl/deck.gl/blob/master/bindings/pydeck/examples/03%20-%20Using%20pydeck%20to%20manipulate%20data.ipynb)
- [deck.gl Feature Request: Add onClick event listener in pydeck](https://github.com/visgl/deck.gl/issues/3864)

## Overview

This RFC proposes direction, APIs and extensions for handling interactive events in pydeck.

## Motivation

pydeck in deck.gl v8.0 has the potential to be a building block for rich interactive python applications, but the interactive facilities are limited:
- lack of ability to register python functions as callbacks (i.e. no official callback support corresponding to `ipywidgets.observe()`)
- no (documented) roadmap for pydeck interactivity featyres
- no (documented) roadmap for interactivity in deck.gl JSON / transport protocol

## Prior Art

- ipywidgets has an `observe()` API.
- pydeck is based on ipywidgets

- [ipywidgets.observe()](https://ipywidgets.readthedocs.io/en/latest/examples/Widget%20Events.html)

Question: Should we use ipywidgets style API, or deck.gl API, or transport API or all of the above?

## Use Cases

### "Raw" Events (Click and Hover, etc)

Hover
- Currently pydeck has "partial support" for Hover events through the [`tooltip` prop](https://deckgl.readthedocs.io/en/latest/tooltip.html).
- This is somewhat "raw" ("innerHTML" props), but serves its purpose.]
- An alternate (or parallel) onHover handler would be a P2

Click
- Click events should be a P1 priority.

Other events?
- deck may have additional hooks, Drag etc? (exposing raw events is not a P1, but selection is, see next section)
- Longer-term: What would a mjolnir.js integration look like? The mjolnir EventManager API is already semi-declarative...

### Selections

deck.gl offers powerful picking feature (deep picking, area picking), but it is not possible to use these features declaratively.

The current version of pydeck has some custom handling to support selections, it does call picking and stores the selected data on `r.deck_widget.selected_data` (although no indication of when the change happens).

```python
pd.DataFrame([r.deck_widget.selected_data])
```

It would be good to have a declarative API for this.

### Measurement Tools (nebula.gl)

nebula.gl has started to offer a selection of measurement tools and it would be incredibly cool to offer these in pydeck.

So far there are measurement tools for:
- Distance and angle selection
- Area measurement tool
- (more tools are  in the roadmap...)

Currently not clear:
- if these measurement tools would be easy to make available declaratively in JSON/pydeck etc (since their activation is presumably "stateful").
- whether "selection" would be good to package as a "tool" (could solve the API design in the previous section).

### Editable Layers (nebula.gl)

With the right callback system in place, it would be great to expose nebula.gl's editable layers, e.g. `EditableGeojsonLayer`) in pydeck.

Python could pass in GeoJSON and get an edited version back...

## Transport

It would be good to base the interaction events on the transport protocol.

Specifying user data for a global event handler:

```json
{
  "@@type": 'ScatterplotLayer',
  "onClick": <user_data> // This object will be serialized and passed back with the event.
}
```

Transport back-channel event

```json
{
  "@@type": 'event'
  "data": <user_data>
}
```

Python specifying a "callable"
```python
import pydeck as pdk
layer = pdk.Layer(
    'ScreenGridLayer',
    df,
    cell_size_pixels=20,
    color_range=COLOR_RANGE,
    get_position='[lng, lat]',
    pickable=True,
    auto_highlight=True,
    on_click=<callable>,<user_data>)
r = pdk.Deck(layers=[layer], initial_view_state=viewport)
```
