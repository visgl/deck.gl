## ViewportLayout

`ViewportLayout` is a react helper component that is intended to render base maps (or other base React components underneath DeckGL viewports.

Since deck.gl is WebGL based, all its viewports need to be in the same canvas (unless you use multiple DeckGL instances, but that can have significant resource and performance impact)

`ViewportLayout` takes a `viewport` prop that contains a mixed array of `Viewports` and "viewport descriptors" (intended to be the same array passed to the `DeckGL` component, and renders any base components specified by viewport descriptors.




## Usage

```js
  const viewports = [
    // viewport
    new FirstPersonViewport({...}),
    // viewport descriptor
    {
      viewport: new WebMercatorViewport({...}),
      component: <StaticMap {...viewportProps}/>
    }
  ];

  render() {
	  <ViewportLayout viewports={viewports}>

	    <DeckGL
	      id="first-person"
	      width={viewportProps.width}
	      height={viewportProps.height}
	      viewports={viewports}
	      useDevicePixelRatio={false}
	      layers={this._renderLayers()}
	      onWebGLInitialized={this._initialize} />

	  </ViewportLayout>
  }
```

## Properties


### viewports

* A singe viewport, or an array of `Viewport`s or "Viewport Descriptors".

Will walk the list looking for viewport descriptors with `component` fields, rendering those components in the position and size specified by that viewport.

Positioning is done with CSS styling on a wrapper div, and sizing by injecting width and height properties.

Also injects the `visible: viewport.isMapSynched()` prop.


### children

Normally the DeckGL component, any children are rendered last, in inteionally on top.
