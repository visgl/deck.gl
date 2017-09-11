# ViewportLayout

`ViewportLayout` is a React helper component that is intended to carefully position React base components underneath DeckGL viewports (such base components are often maps, represented by instances of the `StaticMap` component from [react-map-gl](), but can be any React components).

`ViewportLayout` takes a`viewports` prop and a number of children. It attempts to reposition any top-level children with `viewportId` prop matching the a viewport id under that viewport.


## Usage

```js
  const viewports = [
    new FirstPersonViewport({...}),
    new WebMercatorViewport({id: 'basemap', ...})
  ];

  render() {
    return (
      <ViewportLayout viewports={viewports}>

        <StaticMap
          viewportId='basemap'
          {...viewportProps}/>

        <DeckGL
          id="first-person"
          width={viewportProps.width}
          height={viewportProps.height}
          viewports={viewports}
          useDevicePixelRatio={false}
          layers={this._renderLayers()}
          onWebGLInitialized={this._initialize} />

      </ViewportLayout>
    );
  }
```

## Properties


New Properties
* `children` - Normally the DeckGL component is the last child is intentionally rendered on top.
* `viewports` - A singe viewport, or an array of `Viewport`s or "Viewport Descriptors". Will walk the list looking for viewport ids matching children viewportIds, rendering those components in the position and size specified by that viewport. Positioning is done with CSS styling on a wrapper div, sizing by width and height properties. Also injects the `visible: viewport.isMapSynched()` prop.


```

### viewports

* (`Viewport`|Viewport[]`) - A singe viewport, or an array of `Viewport`s or "Viewport Descriptors". This is intended to be the same viewport list passed to the `DeckGL` compoment

Will walk its top-level children looking for `viewportId` props, rendering those components in the position and size specified by that viewport.

Positioning is done with CSS styling on a wrapper div, and sizing by injecting width and height properties.

Positioned injects the `visible: viewport.isMapSynched()` prop.


### children

Normally the DeckGL component, any children are rendered last, in inteionally on top.


## Remarks

* `viewports` is intended to be the same `Viewport` list passed to the `DeckGL` component (containing a possibly mixed array of `Viewports` and "viewport descriptors" ).
* Since deck.gl is WebGL based, it can only render into a single canvas. Thus all its viewports need to be in the same canvas (unless you use multiple DeckGL instances, but that can have significant resource and performance impact).

## Source

[src/react/viewport-layout.js](https://github.com/uber/deck.gl/blob/4.1-release/src/react/viewport-layout.js)
