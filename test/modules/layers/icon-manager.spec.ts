// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, describe, test, expect, vi} from 'vitest';
import IconManager, {buildMapping, getDiffIcons} from '@deck.gl/layers/icon-layer/icon-manager';
import {device} from '@deck.gl/test-utils/vitest';
import type {Texture} from '@luma.gl/core';

// 16x16 PNG
const TEST_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAAAAAA6mKC9AAAACXBIWXMAAD2EAAA9hAHVrK90AAAAjElEQVQYlXWPMQrCQBBFn7NJI9oobraz1kqv4zk9h4iCEDsLq4gBR4LgGi3WNRhxmj88Zv6f6Sz5LuEPSNMWsLYFnHs3SRBjMY8I+iPoCpMKCiUBHUwFGFPvNKwcynkPuK40ml5ygFyblAzvyZoUcec1M7etAbMAhrfN3R+FKk6UJ+C5Nx+PcFKQn29fOzIjztSX8AwAAAAASUVORK5CYII=';

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
    url: TEST_IMAGE
  }));
});

describe('IconManager async lifecycle', () => {
  const managers: ReturnType<typeof createManager>[] = [];
  const externalTextures: Texture[] = [];
  const icon = {id: 'icon', url: '/icon/lifecycle.png', width: 16, height: 16};

  function createManager() {
    const requests: {
      resolve: (response: Response) => void;
      reject: (error: Error) => void;
    }[] = [];
    const fetchIcon = vi.fn(
      () =>
        new Promise<Response>((resolve, reject) => {
          requests.push({resolve, reject});
        })
    );
    const loadOptions = {fetch: fetchIcon};
    const onUpdate = vi.fn();
    const onError = vi.fn();
    const manager = new IconManager(device, {onUpdate, onError});
    manager.setProps({autoPacking: true, loadOptions});
    const context = {manager, requests, fetchIcon, loadOptions, onUpdate, onError};
    managers.push(context);
    return context;
  }

  function observeTexture(texture: Texture) {
    // WebGL resources are sealed; spy on their shared prototype instead.
    const prototype = Object.getPrototypeOf(texture) as Texture;
    return {
      upload: vi.spyOn(prototype, 'copyExternalImage'),
      mipmaps: vi.spyOn(prototype, 'generateMipmapsWebGL'),
      destroy: vi.spyOn(prototype, 'destroy')
    };
  }

  async function waitForRequests(context: ReturnType<typeof createManager>, count = 1) {
    await vi.waitFor(() => expect(context.requests.length).toBeGreaterThanOrEqual(count));
  }

  async function resolveImage(context: ReturnType<typeof createManager>, index = 0) {
    await waitForRequests(context, index + 1);
    context.requests[index].resolve(await fetch(TEST_IMAGE));
  }

  async function waitForLoaded(manager: IconManager) {
    await vi.waitFor(() => expect(manager.isLoaded).toBe(true));
  }

  afterEach(async () => {
    try {
      const response = await fetch(TEST_IMAGE);
      for (const context of managers) {
        context.manager.finalize();
        // loaders.gl may invoke fetch after finalize, including when an assertion failed early.
        await vi.waitFor(() => {
          for (const request of context.requests) {
            request.resolve(response.clone());
          }
          expect(context.manager.isLoaded).toBe(true);
        });
      }
    } finally {
      for (const texture of externalTextures) {
        texture.destroy();
      }
      vi.restoreAllMocks();
      managers.length = 0;
      externalTextures.length = 0;
    }
  });

  test.each(['success', 'failure'] as const)('ignores a late %s after finalize', async outcome => {
    const context = createManager();
    context.manager.packIcons([icon], d => d);
    await waitForRequests(context);
    const texture = context.manager.getTexture()!;
    const spies = observeTexture(texture);
    // Record unsafe calls without submitting work through a deleted WebGL handle.
    spies.upload.mockReturnValue({width: 16, height: 16});
    spies.mipmaps.mockImplementation(vi.fn());
    context.onUpdate.mockClear();
    context.manager.finalize();

    if (outcome === 'success') {
      await resolveImage(context);
    } else {
      context.requests[0].reject(new Error('Image failed'));
    }
    await waitForLoaded(context.manager);

    expect(spies.upload.mock.contexts).not.toContain(texture);
    expect(spies.mipmaps.mock.contexts).not.toContain(texture);
    expect(context.onUpdate).not.toHaveBeenCalled();
    expect(context.onError).not.toHaveBeenCalled();
    expect(context.manager.getTexture()).toBeNull();
  });

  test('destroys its owned atlas once and cannot restart after finalize', async () => {
    const context = createManager();
    context.manager.packIcons([icon], d => d);
    await waitForRequests(context);
    const texture = context.manager.getTexture()!;
    const {destroy} = observeTexture(texture);

    context.manager.finalize();
    context.manager.finalize();
    context.manager.setProps({autoPacking: true});
    context.manager.packIcons([{...icon, id: 'another-icon'}], d => d);

    expect(destroy.mock.contexts.filter(resource => resource === texture)).toHaveLength(1);
    expect(texture.destroyed).toBe(true);
    expect(context.manager.getTexture()).toBeNull();
    expect(context.fetchIcon).toHaveBeenCalledTimes(1);
    expect(context.manager.isLoaded).toBe(false);
    await resolveImage(context);
    await waitForLoaded(context.manager);
  });

  test('invalidates a released atlas without destroying an external atlas', async () => {
    const context = createManager();
    context.manager.packIcons([icon], d => d);
    await waitForRequests(context);
    const ownedTexture = context.manager.getTexture()!;
    const spies = observeTexture(ownedTexture);
    spies.upload.mockReturnValue({width: 16, height: 16});
    spies.mipmaps.mockImplementation(vi.fn());
    const externalTexture = device.createTexture({width: 16, height: 16, format: 'rgba8unorm'});
    externalTextures.push(externalTexture);
    context.onUpdate.mockClear();
    context.manager.setProps({autoPacking: false, iconAtlas: externalTexture});
    await resolveImage(context);
    await waitForLoaded(context.manager);

    expect(spies.upload.mock.contexts).not.toContain(ownedTexture);
    expect(spies.mipmaps.mock.contexts).not.toContain(ownedTexture);
    expect(context.onUpdate).not.toHaveBeenCalled();
    expect(context.onError).not.toHaveBeenCalled();
    expect(ownedTexture.destroyed).toBe(true);
    expect(context.manager.getTexture()).toBe(externalTexture);

    context.manager.finalize();
    context.manager.finalize();
    expect(spies.destroy.mock.contexts).not.toContain(externalTexture);
    expect(externalTexture.destroyed).toBe(false);
    expect(context.manager.getTexture()).toBeNull();
  });

  test('does not upload an old request into a fresh atlas after an external handoff', async () => {
    const context = createManager();
    context.manager.packIcons([icon], d => d);
    await waitForRequests(context);
    const originalTexture = context.manager.getTexture()!;
    const originalMapping = context.manager.getIconMapping(icon);
    const spies = observeTexture(originalTexture);
    const externalTexture = device.createTexture({width: 16, height: 16, format: 'rgba8unorm'});
    externalTextures.push(externalTexture);

    context.manager.setProps({autoPacking: false, iconAtlas: externalTexture});
    context.manager.setProps({autoPacking: true});
    const newIcon = {...icon, id: 'new-icon', url: '/icon/new.png'};
    context.manager.packIcons([newIcon], d => d);
    await waitForRequests(context, 2);
    const currentTexture = context.manager.getTexture()!;
    context.onUpdate.mockClear();
    await resolveImage(context);
    await resolveImage(context, 1);
    await waitForLoaded(context.manager);

    expect(currentTexture).not.toBe(originalTexture);
    expect(currentTexture).not.toBe(externalTexture);
    expect(originalTexture.destroyed).toBe(true);
    expect(context.manager.getIconMapping(icon)).toBe(originalMapping);
    expect(
      spies.upload.mock.contexts.filter(
        texture =>
          texture === originalTexture || texture === currentTexture || texture === externalTexture
      )
    ).toEqual([currentTexture]);
    expect(context.onUpdate).toHaveBeenCalledExactlyOnceWith(false);
    expect(context.onError).not.toHaveBeenCalled();
    expect(context.fetchIcon).toHaveBeenCalledTimes(2);

    context.manager.finalize();
    expect(currentTexture.destroyed).toBe(true);
    expect(spies.destroy.mock.contexts).not.toContain(externalTexture);
    expect(externalTexture.destroyed).toBe(false);
  });

  test('reports a live load failure with its original context', async () => {
    const context = createManager();
    context.manager.packIcons([icon], d => d);
    await waitForRequests(context);
    context.manager.setProps({loadOptions: {fetch: vi.fn()}});
    const error = new Error('Image failed');
    context.requests[0].reject(error);
    await waitForLoaded(context.manager);

    expect(context.onError).toHaveBeenCalledExactlyOnceWith({
      error,
      url: icon.url,
      source: icon,
      sourceIndex: 0,
      loadOptions: context.loadOptions
    });
  });

  test.each(['success', 'failure'] as const)(
    'ignores a late %s after its mapping entry is replaced',
    async outcome => {
      const context = createManager();
      context.manager.packIcons([icon], d => d);
      await waitForRequests(context);
      const texture = context.manager.getTexture()!;
      const spies = observeTexture(texture);
      const mapping = {x: 64, y: 32, width: 16, height: 16};
      context.manager.setProps({iconMapping: {[icon.id]: mapping}});
      context.onUpdate.mockClear();

      if (outcome === 'success') {
        await resolveImage(context);
      } else {
        context.requests[0].reject(new Error('Image failed'));
      }
      await waitForLoaded(context.manager);

      expect(spies.upload.mock.contexts).not.toContain(texture);
      expect(spies.mipmaps.mock.contexts).not.toContain(texture);
      expect(context.onUpdate).not.toHaveBeenCalled();
      expect(context.onError).not.toHaveBeenCalled();
      expect(context.manager.getTexture()).toBe(texture);
      expect(context.manager.getIconMapping(icon)).toBe(mapping);
      expect(mapping).toEqual({x: 64, y: 32, width: 16, height: 16});
    }
  );

  test.each(['getIcon', 'onUpdate'] as const)(
    'stops packing when %s finalizes the manager',
    callback => {
      const context = createManager();
      if (callback === 'onUpdate') {
        context.onUpdate.mockImplementationOnce(() => context.manager.finalize());
      }

      context.manager.packIcons([icon], d => {
        if (callback === 'getIcon') {
          context.manager.finalize();
        }
        return d;
      });

      expect(context.manager.getTexture()).toBeNull();
      expect(context.fetchIcon).not.toHaveBeenCalled();
      expect(context.onError).not.toHaveBeenCalled();
      expect(context.manager.isLoaded).toBe(true);
    }
  );

  test('can transfer ownership of its current atlas to the caller', async () => {
    const context = createManager();
    context.manager.packIcons([icon], d => d);
    await waitForRequests(context);
    const texture = context.manager.getTexture()!;
    externalTextures.push(texture);
    const spies = observeTexture(texture);
    context.onUpdate.mockClear();
    context.manager.setProps({autoPacking: false, iconAtlas: texture});
    await resolveImage(context);
    await waitForLoaded(context.manager);

    expect(context.manager.getTexture()).toBe(texture);
    expect(texture.destroyed).toBe(false);
    expect(spies.upload.mock.contexts).not.toContain(texture);
    expect(context.onUpdate).not.toHaveBeenCalled();
    expect(context.onError).not.toHaveBeenCalled();

    context.manager.finalize();
    context.manager.finalize();
    expect(spies.destroy.mock.contexts).not.toContain(texture);
    expect(texture.destroyed).toBe(false);
    expect(context.manager.getTexture()).toBeNull();
  });

  test('uploads pending icons into the current atlas after growth', async () => {
    const context = createManager();
    context.manager.packIcons([icon], d => d);
    await waitForRequests(context);
    const originalTexture = context.manager.getTexture()!;
    const {upload} = observeTexture(originalTexture);
    await resolveImage(context);
    await waitForLoaded(context.manager);

    const pendingIcon = {...icon, id: 'pending', url: '/icon/pending.png'};
    context.manager.packIcons([pendingIcon], d => d);
    await waitForRequests(context, 2);
    const largeIcon = {...icon, id: 'large', url: '/icon/large.png', width: 1020, height: 64};
    context.manager.packIcons([largeIcon], d => d);
    const currentTexture = context.manager.getTexture()!;
    await resolveImage(context, 1);
    await resolveImage(context, 2);
    await waitForLoaded(context.manager);

    expect(currentTexture).not.toBe(originalTexture);
    expect(originalTexture.destroyed).toBe(true);
    expect(
      upload.mock.contexts.filter(
        texture => texture === originalTexture || texture === currentTexture
      )
    ).toEqual([originalTexture, currentTexture, currentTexture]);
    expect(context.manager.getIconMapping(icon)).toMatchObject({x: 0, y: 0, width: 16, height: 16});
    expect(context.onError).not.toHaveBeenCalled();
  });

  test.each(['before', 'after'] as const)(
    'keeps a same-ID load valid when it completes %s auto packing is restored',
    async completion => {
      const context = createManager();
      context.manager.packIcons([icon], d => d);
      await waitForRequests(context);
      const texture = context.manager.getTexture()!;
      const {upload} = observeTexture(texture);
      context.manager.setProps({autoPacking: false});

      if (completion === 'before') {
        await resolveImage(context);
        await waitForLoaded(context.manager);
      }
      context.manager.setProps({autoPacking: true});
      context.manager.packIcons([icon], d => d);
      if (completion === 'after') {
        await resolveImage(context);
        await waitForLoaded(context.manager);
      }

      expect(context.fetchIcon).toHaveBeenCalledTimes(1);
      expect(context.manager.getTexture()).toBe(texture);
      expect(upload.mock.contexts.filter(resource => resource === texture)).toHaveLength(1);
      expect(context.manager.getIconMapping(icon)).toMatchObject({width: 16, height: 16});
      expect(context.onError).not.toHaveBeenCalled();
    }
  );
});
