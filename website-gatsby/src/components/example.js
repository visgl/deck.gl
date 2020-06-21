import React, { useState, useEffect, useCallback } from 'react';
import InfoPanel from '../components/info-panel';
import {loadData} from '../utils/data-utils';
import {normalizeParam} from '../utils/format-utils';
import {MAPBOX_STYLES} from '../constants/defaults';

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

    const useParam = useCallback(() => parameters => {
      const newParams = Object.keys(parameters)
        .reduce((acc, name) => {
          acc[name] = normalizeParam(parameters[name]);
          return acc;
        }, {});
      setParams(p => ({...p, ...newParams}));
    }, []);

    const updateMeta = useCallback(() => newMeta => {
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
      <div className="demo" style={style}>
        <DemoComponent
          data={data}
          mapStyle={mapStyle || MAPBOX_STYLES.BLANK}
          params={params}
          useParam={useParam}
          onStateChange={updateMeta}
        />
        {isInteractive && <InfoPanel
          params={params}
          meta={meta}
          updateParam={updateParam}
          sourceLink={DemoComponent.code} >
          {DemoComponent.renderInfo(meta)}
        </InfoPanel>}

        {isInteractive && mapStyle && <div className="mapbox-tip">Hold down shift to rotate</div>}
      </div>
    );
  }
}