import React, {useCallback, useEffect, useState, useTransition} from 'react';
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
import {DeckGL} from '../../../modules/react-fiber/src';
import {Metrics} from './metrics';
import {BasemapLayer} from './basemap-layer';
import {RandomPointLayer, RandomPointLayerMemo} from './random-point-layer';

deck.log.enable();
deck.log.level = 2;

const INITIAL_VIEW_STATE = {
  longitude: -77.0369,
  latitude: 38.9072,
  zoom: 5,
  minZoom: 2,
  maxZoom: 20
};

// Example passthrough component to showcase that you nest React components however you want
function Parent(props) {
  const {children} = props;

  useEffect(() => {
    console.log('logging <Parent /> effect');
  }, []);

  return (
    <>
      <BasemapLayer />
      {children}
    </>
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

  const increment = useCallback(() => {
    setI(prev => prev + 1);
  }, []);

  const onMetrics = useCallback(e => {
    increment();

    startTransition(() => {
      setMetrics(e);
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
              <Parent>
                <RandomPointLayer />
                <RandomPointLayerMemo />
              </Parent>
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
