# View State

A "view state" is a loosely defined set of properties that describe a view point for your visualization. A `View` describes how to visualize a "view state", but does not itself know about the view state.

The view state is typically set initially by the app and then updated by controllers in response to user events (e.g. mouse click and move events etc) or transition events.

The exact properties in the view state can depend on the controller or view being used.


## About Geospatial Positioning

A special property of a deck.gl view state is that it can optionally be equipped with a lng/lat "anchor" and a meter offset. See the article about coordinate systems for more information about this setup.
