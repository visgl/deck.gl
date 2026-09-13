// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

import {Tabs, Tab} from './tabs';
import {useStore} from '../store/device-store';

const DEFAULT_DEVICE_TABS_PROPS = {
  devices: ['webgl2', 'webgpu']
};

export const DeviceTabsPriv = (props) => {
  props = {...DEFAULT_DEVICE_TABS_PROPS, ...props};
  const deviceType = useStore(state => state.deviceType);
  const deviceError = useStore(state => state.deviceError);
  const setDeviceType = useStore(state => state.setDeviceType);

  return (
    <Tabs selectedItem={deviceType} setSelectedItem={setDeviceType}>
      {props.devices.includes('webgl2') && (
        <Tab key="WebGL2" title="WebGL2" tag="webgl">
          {/* <img height="80" src="https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/webgl2.jpg" />*/}
          {deviceError}
        </Tab>
      )}

      {props.devices.includes('webgpu') && (
        <Tab key="WebGPU" title="WebGPU" tag="webgpu">
          {/* <img height="80" src="https://raw.githubusercontent.com/gpuweb/gpuweb/3b3a1632ff1ad6a573330a58710e341bb9d65576/logo/webgpu-horizontal.svg" /> */}
          {deviceError}
        </Tab>
      )}
    </Tabs>
  );
};

export const DeviceTabs = (props) => (
  <BrowserOnly>{() => <DeviceTabsPriv {...props} />}</BrowserOnly>
);
