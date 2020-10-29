# RFC: React API

* **Authors**: Xiaoji Chen
* **Date**: June 2018
* **Status**: **Implemented**


## Abstract

Describes a more flexible system for using the multi-view feature with React.

## Background

As of v5.x, the `DeckGL` React component is a thin wrapper of the core Deck class. The user props passed to the React component are passed as-is to the underlying Deck class. With the API changes in v5.3 and v6.0, primarily related to the multi-view feature, the existing system is encountering several problems, as detailed below.

### Stateless vs. Stateful

With the new auto-resize and auto-control features in v5.3, the underlying Deck instance is now stateful. To make sure that all children are properly re-rendered, the DeckGL component now calls `this.forceUpdate()` in multiple event callbacks.

- `forceUpdate` is discouraged by React for the many side effects it may introduce
- The Deck canvas and its children (e.g. base map) now risk going out of sync, as the underlying Deck instance's state can be updated before the React children. This issue can be reproduced by passing a `initialViewState` prop to `DeckGL` instead of `viewState`. The Deck canvas is updated one tick ahead of the React children.

### Arbitrary Prop Overriding

Although props such as `width`, `height`, `views`, `viewState`, `onViewStateChange` are marked as optional on the core Deck class, in order to correctly display a base map component as child, some must not be skipped:

```jsx
<DeckGL
  layers={layers}
  views={new MapView({id: 'map', controller: MapController})}
  {...this.state.viewState}
  onViewStateChange={({viewState}) => this.setState({viewState})}
>
  <StaticMap
    viewId="map"
    {...this.state.viewState}
    mapStyle={mapStyle}
    mapboxApiAccessToken={mapboxApiAccessToken}
  />
</DeckGL>
```

- The `views` and `viewId` are required for `StaticMap` to receive dynamic `width` and `height` props.
- `onViewStateChange` callback is required because `DeckGL` does not pass `viewState` to its children.
- `viewId` is a non-standard prop and causes warnings when assigned to components such as `div`.
- Regardless if a child component only desires to be placed at the correct offset in a multi-view canvas, its `width` and `height` would still be overwritten to the viewport size during render, which may cause render problems.


### Usage of Deprecated React Lifecycle Methods

`componentWillReceiveProps` is now marked [unsafe](https://reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops) and will be removed in the next major version.

## Proposal: Render Callbacks

`DeckGL` accepts render callbacks as children. This is a common React pattern used by libraries such as [react-motion](https://github.com/chenglou/react-motion) and [react-virtualized](https://github.com/bvaughn/react-virtualized).

- Static children are still supported.
- Children in a single-view canvas no longer need to use `viewId` to subscribe to changes in the default view.
- A child can determine how to best handle/discard the view information from the parent.
- The user no longer have the burden to trigger rerender on viewport change, therefore able to leverage auto-control in a React app.

**Stateless example:**

```jsx
<DeckGL
  layers={layers}
  viewState={this.state.viewState}
  onViewStateChange={({viewState}) => this.setState({viewState})}
  controller={MapController}
>
  {({width, height, viewState, viewport}) => <StaticMap
    width={width}
    height={height}
    viewState={this.state.viewState}
    mapStyle={mapStyle}
    mapboxApiAccessToken={mapboxApiAccessToken}
  />}
</DeckGL>
```

**Statefull example:**

```jsx
<DeckGL
  layers={layers}
  initialViewState={INITIAL_VIEW_STATE}
  onViewStateChange={console.log}
  controller={MapController}
>
  {({width, height, viewState, viewport}) => <StaticMap
    width={width}
    height={height}
    viewState={viewState}
    mapStyle={mapStyle}
    mapboxApiAccessToken={mapboxApiAccessToken}
  />}
</DeckGL>
```

**Using react-map-gl components:**

```jsx
<DeckGL
  layers={layers}
  initialViewState={INITIAL_VIEW_STATE}
  controller={MapController}
>
  {({width, height, viewState, viewport}) => labels.map(label => (
    <Popup
      key={label.id}
      longitude={label.longitude}
      latitude={label.latitude}
      viewport={viewport}
    >
      {label.content}
    </Popup>
  ))}
</DeckGL>
```

## Proposal: JSX View

Similar to JSX layers, we can support JSX views. It gives the JSX a cleaner hierarchy in multi-view apps:

```jsx
<DeckGL
  layers={layers}
>
  <MapView 
    initialViewState={INITIAL_MAP_VIEW_STATE}
    onViewStateChange={console.log}
    controller={MapController}
  >
    {({width, height, viewState}) => <StaticMap
      width={width}
      height={height}
      viewState={viewState}
      mapStyle={mapStyle}
      mapboxApiAccessToken={mapboxApiAccessToken}
    />}
  </MapView>

  <FirstPersonView 
    initialViewState={INITIAL_FIRST_PERSON_VIEW_STATE}
    onViewStateChange={console.log}
    controller={FirstPersonController} />

</DeckGL>
```
