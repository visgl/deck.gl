# RFC: Real-Time Data Support in deck.gl

* **Author**: Ib Green
* **Date**: May 2019
* **Status**: **Draft**

## Abstract

This RFC suggests a new property to deck.gl layers that activates a regular polling or reload of data from a provided URL, to facilitate support of real-time data in deck.gl

## Background

Implementing polling in a deck.gl application can require quite a bit of logic. As usual this has two down-sides:
- Makes a rather

### Example of Current API

This is a cleaned-up version of the `ScenegraphLayer` demo app that regularly pulls airline positions from a server.

```js
const DATA_URL = '...';
const REFRESH_TIME_MS = 5000;

export class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {refreshCount: 0};
  }

  componentDidMount() {
    this._updateRefreshCount();
  }

  componentWillUnmount() {
     if (this.refreshTimeoutId) {
       clearTimeout(this.refreshTimeoutId);
    }
  }

  _updateRefreshCount() {
    this.setState({refreshCount: this.state.refreshCount + 1});
    this.refreshTimeoutId = setTimeout(() => this._updateRefreshCount(), REFRESH_TIME_MS);
  }

  _renderLayers() {
    const {refreshCount} = this.state;
    return [
      new Layer({
        data: DATA_URL
      })
    ];
  }
}
```

## Proposal: Built-in Support for Polling data

### Example of New API

```js
const DATA_URL = '...';
const REFRESH_TIME_MS = 5000;

export class App extends React.Component {
  _renderLayers() {
    return [
      new Layer({
        data: DATA_URL,
        dataRefreshIntervalMs: REFRESH_TIME_MS
      })
    ];
  }
}
```

### Documentation Changes

api-reference/layer.md:

`dataRefreshIntervalMs` (Number, Optional)

Supplying this property will trigger the layer to reload data from the `data` URL at the specified interval.

Note: this property only has an effect if the `data` prop is a URL (`String`).

## Future Extensions

### Support Cache Defeater Parameters?

Can we assume that services that apps want to regularly poll do not get cached?

A typical way to defeat caching is to add an unused parameter with a unique value.

Is it worth defining new semantics for the data prop, or additional props, to support this case?

```js
export class App extends React.Component {
  _renderLayers() {
    return [
      new Layer({
        data: ({refreshCount}) => `${DATA_URL}?refreshCount=${refreshCount}`,
        dataRefreshIntervalMs: REFRESH_TIME_MS
      })
    ];
  }
}
```

### Smart Transitions

Automated data polling will become really powerful if we improve transitions to support object ids/keys so that applications do not need to manage sorting/aligning the arrays.

Agains see e.g [ScenegraphLayer demo code](https://github.com/uber/deck.gl/blob/master/examples/website/scenegraph-layer/app.js#L64).

This would put advanced animated real-time animated data visualizations into the hands of novice users, as well as json and python API users.

## Audit Notes

### New property `dataRefreshIntervalMs`

Naming:
- `data` prefix is used by a number of data related props.
- `Ms` suffix - Time unit is a common point of confusion for devs. milliseconds are is used by JS timestamps.
- Alternatives: `refresh`/`poll`/`update`, ...
