// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import IconManager, {buildMapping, getDiffIcons} from '@deck.gl/layers/icon-layer/icon-manager';
import {device} from '@deck.gl/test-utils';

const DATA = [
  {
    icon: {
      width: 12,
      height: 12,
      anchorY: 12,
      url: '/icon/0'
    }
  },
  {
    icon: {
      width: 24,
      height: 24,
      anchorY: 24,
      url: '/icon/1'
    }
  },
  {
    icon: {
      width: 36,
      height: 36,
      anchorY: 36,
      url: '/icon/2'
    }
  },
  {
    icon: {
      width: 16,
      height: 16,
      anchorY: 16,
      url: '/icon/3'
    }
  },
  {
    icon: {
      width: 28,
      height: 28,
      anchorY: 28,
      url: '/icon/4'
    }
  }
];

const EXPECTED_MAPPING = {
  '/icon/0': Object.assign({}, DATA[0].icon, {x: 0, y: 0}),
  '/icon/1': Object.assign({}, DATA[1].icon, {x: 14, y: 0}),
  '/icon/2': Object.assign({}, DATA[2].icon, {x: 0, y: 26}),
  '/icon/3': Object.assign({}, DATA[3].icon, {x: 38, y: 26}),
  '/icon/4': Object.assign({}, DATA[4].icon, {x: 0, y: 64})
};

test('IconManager#buildMapping', () => {
  /*
   *   +-----------+----------------+----------------+
   *   | /icon/0   | /icon/1        |                |
   *   |           |                |                |
   *   |           |                |                |
   *   |           |                |                |
   *   |           |                |                |
   *   |           |                |                |
   *   +-----------+----------------+-----------+----+
   *   | /icon/2                    | /icon/3   |    |
   *   |                            |           |    |
   *   |                            |           |    |
   *   |                            |           |    |
   *   |                            |           |    |
   *   |                            |           |    |
   *   |                            |           |    |
   *   |                            |           |    |
   *   +---------------------+------+-----------+----+
   *   | /icon/4             |                       |
   *   |                     |                       |
   *   |                     |                       |
   *   |                     |                       |
   *   |                     |                       |
   *   |                     |                       |
   *   |                     |                       |
   *   |                     |                       |
   *   +---------------------+-----------------------+
   */

  const results = buildMapping({
    icons: DATA.map(d => d.icon),
    buffer: 2,
    canvasWidth: 64
  });

  expect(results.mapping, 'Should generate mapping as expectation.').toEqual(EXPECTED_MAPPING);
  expect(results.canvasHeight, 'Canvas height should match expectation.').toBe(128);
  expect(results.xOffset, 'xOffset should match expectation.').toBe(30);
  expect(results.yOffset, 'yOffset height should match expectation.').toBe(64);
  expect(results.rowHeight, 'rowHeight should match expectation.').toBe(28);
});

test('IconManager#buildMapping with additional icons', () => {
  const additionalData = [
    {
      icon: {
        width: 36,
        height: 36,
        anchorY: 36,
        url: '/icon/5'
      }
    }
  ];

  const results = buildMapping({
    mapping: EXPECTED_MAPPING,
    icons: additionalData.map(d => d.icon),
    rowHeight: 28,
    xOffset: 30,
    yOffset: 64,
    buffer: 2,
    canvasWidth: 64
  });

  const expectedMapping = {
    ...EXPECTED_MAPPING,
    '/icon/5': Object.assign({}, additionalData[0].icon, {x: 0, y: 94})
  };

  expect(results.mapping, 'Should generate mapping as expectation.').toEqual(expectedMapping);
  expect(results.canvasHeight, 'Canvas height should match expectation.').toBe(256);
  expect(results.xOffset, 'xOffset should match expectation.').toBe(38);
  expect(results.yOffset, 'yOffset height should match expectation.').toBe(94);
  expect(results.rowHeight, 'rowHeight height should match expectation.').toBe(36);
});

test('IconManager#getDiffIcons', () => {
  const data = [
    {
      icon: {
        id: 'icon-0',
        width: 12,
        height: 12,
        anchorY: 12,
        url: '/icon/0-123'
      }
    },
    {
      icon: {
        id: 'icon-1',
        width: 24,
        height: 24,
        anchorY: 24,
        url: '/icon/1'
      }
    },
    {
      icon: {
        width: 36,
        height: 36,
        anchorY: 36,
        url: '/icon/2'
      }
    },
    {
      icon: {
        width: 16,
        height: 16,
        anchorY: 16,
        url: '/icon/3'
      }
    }
  ];

  const cachedIcons = {
    'icon-0': {
      id: 'icon-0',
      width: 12,
      height: 12,
      anchorY: 12,
      url: '/icon/0'
    },
    'icon-1': {
      id: 'icon-1',
      width: 24,
      height: 24,
      anchorY: 24,
      url: '/icon/1'
    },
    '/icon/2': {
      width: 36,
      height: 36,
      anchorY: 36,
      url: '/icon/2'
    }
  };

  const expected = {
    // icon url changed
    'icon-0': {
      id: 'icon-0',
      width: 12,
      height: 12,
      anchorY: 12,
      url: '/icon/0-123',
      source: data[0],
      sourceIndex: 0
    },
    // new icon
    '/icon/3': {
      width: 16,
      height: 16,
      anchorY: 16,
      url: '/icon/3',
      source: data[3],
      sourceIndex: 3
    }
  };

  const icons = getDiffIcons(data, d => d.icon, cachedIcons);
  expect(icons, 'Should get diff icons as expectation.').toEqual(expected);
});

test('IconManager#events', () => {
  const onError = e => {
    expect(e.source, 'onError is called with source object').toEqual({id: 0});
    iconManager.finalize(); // eslint-disable-line
  };
  const iconManager = new IconManager(device, {onError});

  iconManager.setProps({
    autoPacking: true,
    loadOptions: {}
  });
  iconManager.packIcons([{id: 0}], d => ({
    url: 'icon.png',
    width: 64,
    height: 64
  }));
});

test('IconManager#resize', () => {
  // 16x16
  const testImage =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAAAAAA6mKC9AAAACXBIWXMAAD2EAAA9hAHVrK90AAAAjElEQVQYlXWPMQrCQBBFn7NJI9oobraz1kqv4zk9h4iCEDsLq4gBR4LgGi3WNRhxmj88Zv6f6Sz5LuEPSNMWsLYFnHs3SRBjMY8I+iPoCpMKCiUBHUwFGFPvNKwcynkPuK40ml5ygFyblAzvyZoUcec1M7etAbMAhrfN3R+FKk6UJ+C5Nx+PcFKQn29fOzIjztSX8AwAAAAASUVORK5CYII=';
  let updateCount = 0;

  const icons = [
    {id: 'no-resize', width: 16, height: 16},
    {id: 'down-size', width: 12, height: 12},
    {id: 'preserve-aspect-ratio-landscape', width: 32, height: 24},
    {id: 'preserve-aspect-ratio-portrait', width: 12, height: 16}
  ];

  const assertIconFrame = (id, expected) => {
    const mapping = iconManager.getIconMapping({id});
    expect(mapping.x, `${id} x`).toBe(expected.x);
    expect(mapping.y, `${id} y`).toBe(expected.y);
    expect(mapping.width, `${id} width`).toBe(expected.width);
    expect(mapping.height, `${id} height`).toBe(expected.height);
  };

  const onUpdate = () => {
    updateCount++;
    if (updateCount > icons.length) {
      assertIconFrame('no-resize', {x: 0, y: 0, width: 16, height: 16});
      assertIconFrame('down-size', {x: 20, y: 0, width: 12, height: 12});
      assertIconFrame('preserve-aspect-ratio-landscape', {x: 40, y: 0, width: 24, height: 24});
      assertIconFrame('preserve-aspect-ratio-portrait', {x: 72, y: 2, width: 12, height: 12});
    }
  };

  const onError = evt => {
    throw new Error(evt.error.message);
  };

  const iconManager = new IconManager(device, {onUpdate, onError});

  iconManager.setProps({
    autoPacking: true
  });
  iconManager.packIcons(icons, d => ({
    ...d,
    url: testImage
  }));
});
