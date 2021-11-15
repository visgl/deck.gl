# fetchMap

`fetchMap` is an API that instantiates layers configured in [CARTO Builder](https://carto.com/builder/) for use with deck.gl. It is available starting with CARTO Maps API version v3.

## Usage

### Static display of a CARTO map

```js
import {Deck} from '@deck.gl/core';
import {fetchMap} from '@deck.gl/carto';

const cartoMapId = 'ff6ac53f-741a-49fb-b615-d040bc5a96b8';
fetchMap({cartoMapId}).then(map => new Deck(map));
```

### Integration with basemap

```js
import mapboxgl from 'mapbox-gl';

fetchMap({cartoMapId}).then(({initialViewState, mapStyle, layers}) => {
  const MAP_STYLE = `https://basemaps.cartocdn.com/gl/${mapStyle.styleType}-gl-style/style.json`;
  const map = new mapboxgl.Map({container: 'map', style: MAP_STYLE, interactive: false});
  deck.setProps({
    controller: true,
    initialViewState,
    layers,
    onViewStateChange: ({viewState}) => {
      const {longitude, latitude, ...rest} = viewState;
      map.jumpTo({center: [longitude, latitude], ...rest});
    }
  });
});
```
