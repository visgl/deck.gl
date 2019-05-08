# RFC: Real-Time Data Support in deck.gl

* **Author**: Ib Green
* **Date**: May 2019
* **Status**: **Draft**

## Abstract

This RFC suggests a new property to deck.gl layers that activates a regular polling or reload of data from a provided URL, to facilitate support of real-time data in deck.gl

## Background

Implementing polling in a deck.gl application can require quite a bit of logic (see code example below):
- Makes implementing real-time applications harder and less obvious than it needs to be for users
- Makes real-time usage almost impossible in declarative APIs like `@deck.gl/json`.

Being able to talk about "real time" support in our documentation could also be powerful, and we could implement additional features that support this use case (see extensions below).

### Example of Current API

This is a cleaned-up version of the `ScenegraphLayer` demo app that regularly pulls airline positions from a server.

```js
const DATA_URL = '...';
const REFRESH_TIME_MS = 30000;

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
        // NOTE: the parameter is not for cache busting, but to trigger the diff engine to reload
        data: `${DATA_URL}?refreshCount=${refreshCount}`
      })
    ];
  }
}
```

## Proposal: Built-in Support for Polling data

### Example of New API

```js
const DATA_URL = '...';
const REFRESH_TIME_MS = 30000;

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

### Example: Data requires post-processing, merge with previous data

Using the `dataTransform` property and `onDataLoaded` callbacks from a separate RFC, it is possible to do more advanced processing, e.g. match keys to make animations work.

```js
export class App extends React.Component {
  // In order to make animations WORK we need to always return the same
  // objects in the exact same order. This function will discard new objects
  // and only update existing ones.
  _sortForTransitions(data, layer) {
    const oldData = layer.props.data;
    if (oldData.length === 0) {
      return data;
    }
    const dataAsObj = {};
    data.forEach(row => (dataAsObj[row.UNIQUE_ID] = row));
    return oldData.map(row => dataAsObj[row.UNIQUE_ID] || row);
  }

  _renderLayers() {
    return [
      new Layer({
        data: DATA_URL,
        dataRefreshIntervalMs: REFRESH_TIME_MS,
        dataTransform: this._sortForTransitions,
        transitions: {
          getPosition: REFRESH_TIME_MS * 0.9
        },
      })
    ];
  }
}
```

### Example: Response affects next query

This can be handle with the `onDataLoaded` callback proposed in separate RFC.

```js
export class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      reloadIntervalMs: 5000,
      queryLimit: 1000
    };
  }

  // Assumes data indicates when next poll should be made and how much data needs to be polled.
  _updateQueryParamsFromResponse(data) {
    this.setState({
      reloadIntervalMs: data.header.nextInterval,
      queryLimit: data.headerlengh
    });
  }

  _renderLayers() {
    return [
      new Layer({
        data: `${DATA_URL}?limit=${this.state.queryLimit}`,
        dataRefreshIntervalMs: this.state.reloadIntervalMs,

        onDataLoaded: this._updateQueryParamsFromResponse,
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

In this RFC we assume that services that apps want to regularly poll do not get cached. If this becomes an issue. A typical way to defeat caching is to add an unused parameter with a unique value. We can easily maintain a counter under the hood, but how would we add it to the URL?

Is it worth defining new semantics for the data prop, or additional props, to support this case? E.g:

```js
const DATA_URL = '...';
const REFRESH_TIME_MS = 30000;

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
