import test from 'tape';
import {buildMapping, getDiffIcons} from '@deck.gl/layers/icon-layer/icon-manager';

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

test('IconManager#buildMapping', t => {
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

  t.deepEqual(results.mapping, EXPECTED_MAPPING, 'Should generate mapping as expectation.');
  t.equal(results.canvasHeight, 128, 'Canvas height should match expectation.');
  t.equal(results.xOffset, 30, 'xOffset should match expectation.');
  t.equal(results.yOffset, 64, 'yOffset height should match expectation.');
  t.equal(results.rowHeight, 28, 'rowHeight should match expectation.');

  t.end();
});

test('IconManager#buildMapping with additional icons', t => {
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

  t.deepEqual(results.mapping, expectedMapping, 'Should generate mapping as expectation.');
  t.equal(results.canvasHeight, 256, 'Canvas height should match expectation.');
  t.equal(results.xOffset, 38, 'xOffset should match expectation.');
  t.equal(results.yOffset, 94, 'yOffset height should match expectation.');
  t.equal(results.rowHeight, 36, 'rowHeight height should match expectation.');

  t.end();
});

test('IconManager#getDiffIcons', t => {
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
      url: '/icon/0-123'
    },
    // new icon
    '/icon/3': {
      width: 16,
      height: 16,
      anchorY: 16,
      url: '/icon/3'
    }
  };

  const icons = getDiffIcons(data, d => d.icon, cachedIcons);
  t.deepEqual(icons, expected, 'Should get diff icons as expectation.');

  t.end();
});
