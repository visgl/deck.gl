# View States

A "view state" contains a position and direction. It is a small javascript object containing a couple of fields that specify a world position.

View states are typically initialized by the application on startup to some initial position, and then normally updated automatically in response to user events (e.g. mouse click and move events etc) by deck.gl `Controller`s.

## Using View States

View States are used by [`View`](/docs/api-reference/view.md) classes. The application's `View` instances contain information about how to visualize a "view state". The Views can be thought of as cameras positioned using your view states.


## View State Properties

> While the exact properties in the view state will depend on the controller or view being used, applications typically do not need to deal directly with those properties, except during view state initialization.

There is not a single set of pre-defined view state parameters, but rather each controller and view can define its own set of view state parameters. Some views and controllers use compatible view states, allowing you to use the in combination, and to show the same "view state" using different Views. In general you need to check which controllers and views can be used together.

| View States    | Props                           | Optional | Description |
| ---            | ---                             | ---      | ---         |
| Geospatial     | `longitude`, `latitude`, `zoom` |          |             |
| Positional     | `position`, `direction`         |          |             |
| Geo-positional | `position`, `direction`         | `longitude`, `latitude`, `zoom` | Optionally geospatially |anchored. |
| Orbit          | `rotationX`, `rotationY`, ...   | -        | A custom set of view state parameters for the `OrbitController`. |

Note that "projection related" parameters, such as field of view, near and far planes etc must be specified using `View` classes.


## About Geospatial Positioning

A special property of a deck.gl view state is that it can optionally be equipped with a lng/lat "anchor" and a meter offset. See the article about coordinate systems for more information about this setup.


## Remarks

* Per cartographic tradition, angles (including `latitude`, `longitude`, `pitch` and `bearing`) are typically specified in degrees, not radians.
* `longitude` and `latitude` are specified in degrees from Greenwich meridian and the equator respectively, and altitude is specified in meters above sea level.
* For geospatial coordinates, `Web Mercator Projection` (spherical earth) is assumed.

