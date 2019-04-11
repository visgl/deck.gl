<p class="badges">
  <img src="https://img.shields.io/badge/geopspatial-yes-lightgrey.svg?style=flat-square" alt="geospatial" />
</p>

# MapView Class (Experimental)

The [`MapView`] class is a subclass of [View](/docs/api-reference/view.md). This viewport creates a geospatial "camera" that looks at a position on a map from a certain direction.

To render, `MapView` needs to be used together with a `viewState` with the following parameters:

- `longitude` (`Number`) - longitude at the map center
- `latitude` (`Number`) - latitude at the map center
- `zoom` (`Number`) - zoom level
- `pitch` (`Number`, optional) - pitch angle in degrees. Default `0`.
- `bearing` (`Number`, optional) - bearing angle in degrees. Default `0`.
- `maxZoom` (`Number`, optional) - max zoom level. Default `20`.
- `minZoom` (`Number`, optional) - min zoom level. Default `0`.
- `maxPitch` (`Number`, optional) - max pitch angle. Default `60`.
- `minPitch` (`Number`, optional) - min pitch angle. Default `0`.

For more information on using `View` classes, consult the [Views](/docs/developer-guide/views.md) article.

The default controller of a `MapView` is [MapController](/docs/api-reference/map-controller.md).

## Constructor

```js
const view = new MapView({...});
```

`MapView` takes the same parameters as the [View](/docs/api-reference/view.md) superclass constructor.


## Remarks

- In the React library, `MapView` support automatic synchronization with base maps components. See [DeckGL](/docs/api-reference/react/deckgl.md)
