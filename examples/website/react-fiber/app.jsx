import React, {useCallback, useEffect, useRef, useState, useTransition} from 'react';
import {createRoot} from 'react-dom/client';
import {
  Button,
  Grid,
  View,
  Flex,
  defaultTheme,
  LabeledValue,
  Provider
} from '@adobe/react-spectrum';
import {randomPoint} from '@turf/random';
import sample from '@turf/sample';
import {DeckGL} from '../../../modules/react-fiber/src';

deck.log.enable();
deck.log.level = 0;

const INITIAL_VIEW_STATE = {
  longitude: -77.0369,
  latitude: 38.9072,
  zoom: 5,
  minZoom: 2,
  maxZoom: 20
};

const points = randomPoint(10000, {bbox: [-180, -90, 180, 90]});

function Metrics(props) {
  const {data} = props;

  const output = Object.entries(data).reduce((prev, next, i) => {
    if (prev[i]) {
      prev[i] = next;
    } else {
      prev.push(next);
    }

    return prev;
  }, []);

  return (
    <Flex direction="column" gap="size-100">
      {output.map(pairs => {
        return (
          <LabeledValue key={pairs[0]} label={pairs[0]} value={pairs[1]} labelPosition="side" />
        );
      })}
    </Flex>
  );
}

function App() {
  const [_, startTransition] = useTransition();
  const [viewState, setViewState] = useState(() => INITIAL_VIEW_STATE);
  const onViewStateChange = useCallback(event => {
    startTransition(() => {
      setViewState(event.viewState);
    });
  }, []);

  const [i, setI] = useState(0);
  const [metrics, setMetrics] = useState({});
  const [data, setData] = useState([]);

  const increment = useCallback(() => {
    setI(prev => prev + 1);
  }, []);

  const onMetrics = useCallback(e => {
    increment();

    startTransition(() => {
      setMetrics(e);
    });

    startTransition(() => {
      setData(sample(points, 1000));
    });
  }, []);

  return (
    <Provider theme={defaultTheme} height="100%">
      <Grid
        areas={['sidebarleft content sidebarright']}
        columns={['size-3000', '1fr', 'size-3000']}
        gap="size-100"
        height="100%"
      >
        <View backgroundColor="gray-100" gridArea="sidebarleft" padding="size-100">
          <Flex direction="column" gap="size-100">
            <LabeledValue label="Count" value={i} labelPosition="side" />
            <Button variant="accent" onClick={increment}>
              Increment
            </Button>
          </Flex>
        </View>
        <View backgroundColor="gray-50" gridArea="content" position="relative">
          <DeckGL
            viewState={viewState}
            onViewStateChange={onViewStateChange}
            _onMetrics={onMetrics}
            // initialViewState={INITIAL_VIEW_STATE}
          >
            <mapView controller={true} id="mapview" repeat>
              <geoJsonLayer
                id="basemap"
                data="https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_land.geojson"
                stroked={true}
                filled={true}
                getFillColor={[30, 80, 120]}
                getLineColor={[0, 255, 255]}
                lineWidthMinPixels={1}
              />
              <scatterplotLayer
                data={data.features}
                getPosition={feature => {
                  return feature.geometry.coordinates;
                }}
                radiusMinPixels={5}
                filled={true}
                getFillColor={[255, 255, 255]}
                stroked={false}
              />
            </mapView>
          </DeckGL>
        </View>
        <View backgroundColor="gray-100" gridArea="sidebarright" padding="size-100">
          <Metrics data={metrics} />
        </View>
      </Grid>
    </Provider>
  );
}

const root = createRoot(document.getElementById('app'));
root.render(<App />);
