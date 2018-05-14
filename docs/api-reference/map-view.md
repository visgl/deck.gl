<p class="badges">
  <img src="https://img.shields.io/badge/geopspatial-yes-lightgrey.svg?style=flat-square" alt="geospatial" />
</p>

# MapView Class (Experimental)

The [`MapView`] class is a subclass of [View](/docs/api-reference/view.md). This viewport creates a geospatial "camera" that looks at a position on a map from a certain direction.

To render, `MapView` requires the application to use a `viewState` that contains at least `longitude`, `latitude` and `zoom` parameters. `MapView` will also consider the `pitch` and `bearing` parameters.

For more information on using `View` classes, consult the [Views](/docs/developer-guide/views.md) article.


## Usage

```js
const viewport = new MapView({id: 'primary-map'});
```


## Constructor

Creates a new `MapView` instance.

`new MapView({id, ...});`

`MapView` takes the same parameters as the [View](/docs/api-reference/view.md) superclass constructor.


## Remarks

* In the React library, `MapView` support automatic synchronization with base maps components. See [DeckGL](/docs/api-reference/react/deckgl.md)
