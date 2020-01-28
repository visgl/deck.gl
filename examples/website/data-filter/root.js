import React from 'react';
import {render} from 'react-dom';
import {Client as Styletron} from 'styletron-engine-atomic';
import {Provider as StyletronProvider} from 'styletron-react';
import {LightTheme, BaseProvider} from 'baseui';
import App from './app';

const engine = new Styletron();

// Source data GeoJSON
const DATA_URL =
  'https://raw.githubusercontent.com/uber-web/kepler.gl-data/master/earthquakes/data.csv'; // eslint-disable-line

function Root({data}) {
  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={LightTheme}>
        <App data={data} />
      </BaseProvider>
    </StyletronProvider>
  );
}

export function renderToDOM(container) {
  render(<Root />, container);
  require('d3-request').csv(DATA_URL, (error, response) => {
    if (!error) {
      const data = response.map(row => ({
        timestamp: new Date(`${row.DateTime} UTC`).getTime(),
        latitude: Number(row.Latitude),
        longitude: Number(row.Longitude),
        depth: Number(row.Depth),
        magnitude: Number(row.Magnitude)
      }));
      render(<Root data={data} />, container);
    }
  });
}
