# MapView Class (Experimental)

The [`MapView`] class is a subclass of [View](/docs/api-reference/view.md). This viewport creates a "camera" that looks at an exact position, position using the direction, distance and orientation specified by the application.

This is in contrast with e.g. [FirstPersonView](/docs/api-reference/first-person-view.md) where the camera will be position exactly at the specified position.

For more information consult the [Views](/docs/advanced/views.md) article.

## Usage

```js
const viewport = new MapView({
  id: 'primary-map'
});
```
