# MapController

The `MapController` class can be passed to the `Deck.controller` or `DeckGL.controller` prop to specify that map interaction should be enabled.


## Usage

```js
  <DeckGL
    controller={MapController} // NOTE: Constructor is passed. Do not call 'new MapController()'
    viewState={viewState}
    onViewportChange={v => this.setState({viewport: v})}
    />
```

## Methods

Note that the `MapController` class should not be instantiated by the application.
