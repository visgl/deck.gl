import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import InfoPanel from '../components/info-panel';
import {loadData} from '../utils/data-utils';
import {normalizeParam} from '../utils/format-utils';
import {MAPBOX_STYLES} from '../constants/defaults';

const DemoContainer = styled.div`
position: relative;
overflow: hidden !important;
height: 100%;
transition: height 600ms ease-in;

.tooltip, .deck-tooltip {
  position: absolute;
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  max-width: 300px;
  font-size: 12px;
  z-index: 9;
  pointer-events: none;
}
`;

const MapTip = styled.div`
position: absolute;
right: 12px;
bottom: 20px;
color: #fff;
mix-blend-mode: difference;

@media screen and (max-width: ${props => props.theme.breakpoints.medium}px) {
  display: none;
}
`;

export default function(DemoComponent, {isInteractive = true, style} = {}) {
  const {parameters = {}, mapStyle} = DemoComponent;
  const defaultParams = Object.keys(parameters)
    .reduce((acc, name) => {
      acc[name] = normalizeParam(parameters[name]);
      return acc;
    }, {});

  const defaultData = Array.isArray(DemoComponent.data) ? DemoComponent.data.map(_ => null) : null;

  return function() {
    const [data, setData] = useState(defaultData);
    const [params, setParams] = useState(defaultParams);
    const [meta, setMeta] = useState({});

    const useParam = useCallback(parameters => {
      const newParams = Object.keys(parameters)
        .reduce((acc, name) => {
          acc[name] = normalizeParam(parameters[name]);
          return acc;
        }, {});
      setParams(p => ({...p, ...newParams}));
    }, []);

    const updateMeta = useCallback(newMeta => {
      setMeta(m => ({...m, ...newMeta}));
    }, []);

    useEffect(() => {
      let source = DemoComponent.data;
      if (!source) {
        return;
      }

      const isArray = Array.isArray(source);

      if (!isArray) {
        source = [source];
      }

      source.forEach(({url, worker}, index) => {
        loadData(url, worker, (resultData, resultMeta) => {
          if (isArray) {
            setData(d => {
              const newData = d.slice();
              newData[index] = resultData;
              return newData;
            });
          } else {
            setData(resultData);
          }
          if (resultMeta) {
            setMeta(m => ({...m, ...resultMeta}));
          }
        });
      });
    }, []);

    const updateParam = (name, value) => {
      const p = params[name];
      if (p) {
        setParams({
          ...params,
          [name]: normalizeParam({...p, value})
        });
      }
    }

    return (
      <DemoContainer style={style}>
        <DemoComponent
          data={data}
          mapStyle={mapStyle || MAPBOX_STYLES.BLANK}
          params={params}
          useParam={useParam}
          onStateChange={updateMeta}
        />
        {isInteractive && <InfoPanel
          title={DemoComponent.title}
          params={params}
          meta={meta}
          updateParam={updateParam}
          sourceLink={DemoComponent.code} >
          {DemoComponent.renderInfo(meta)}
        </InfoPanel>}

        {isInteractive && mapStyle && <MapTip>Hold down shift to rotate</MapTip>}
      </DemoContainer>
    );
  }
}