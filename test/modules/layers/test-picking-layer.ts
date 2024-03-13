import {device} from '@deck.gl/test-utils';
import {processPickInfo} from '@deck.gl/core/lib/picking/pick-info';
import {
  type Layer,
  type Viewport,
  type PickingInfo,
  type CompositeLayer,
  LayerManager
} from '@deck.gl/core';

// Test getPickingInfo and updateAutoHighlight methods
// @param layer {Layer} - a layer instance
// @param testCases {Array<Object>}
// @param testCase.pickedColor {Uint8Array} - RGBA of picked color
// @param testCase.pickedLayerId {String} - picked layer id
// @param testCase.mode {String} - default 'hover'
// @param testCase.onAfterUpdate {Function} - callback after picking
export async function testPickingLayer({
  layer,
  viewport,
  testCases
}: {
  layer: Layer;
  viewport?: Viewport;
  testCases: {
    pickedColor: Uint8Array;
    pickedLayerId: string | null;
    mode: 'hover' | 'click';
    onAfterUpdate: (params: {layer: Layer; subLayers: Layer[]; info: PickingInfo}) => void;
  }[];
}) {
  // Initialize layer
  const layerManager = new LayerManager(device, {viewport});
  layerManager.setLayers([layer]);

  await updateAll(layerManager);

  const lastPickedInfo = {
    index: -1,
    layerId: null,
    info: null
  };

  for (const {pickedColor, pickedLayerId, mode = 'hover', onAfterUpdate} of testCases) {
    const pickedLayer = layerManager.layers.find(l => l.id === pickedLayerId);
    if (pickedLayerId && !pickedLayer) {
      throw new Error(`testPickingLayer: cannot find layer ${pickedLayerId}`);
    }

    const pickInfo = {
      pickedColor,
      pickedLayer,
      pickedObjectIndex: layer.decodePickingColor(pickedColor)
    };

    const infos = processPickInfo({
      pickInfo,
      lastPickedInfo,
      mode,
      layers: layerManager.layers,
      viewports: [layerManager.context.viewport],
      x: 1,
      y: 1,
      pixelRatio: 1
    });

    await updateAll(layerManager);

    onAfterUpdate({
      layer,
      subLayers: (layer.isComposite && (layer as CompositeLayer).getSubLayers()) || [],
      info: Array.from(infos.values()).pop() as PickingInfo
    });
  }

  layerManager.finalize();
}

async function updateAll(layerManager): Promise<void> {
  return new Promise(resolve => {
    const onAnimationFrame = () => {
      if (layerManager.needsUpdate()) {
        layerManager.updateLayers();
      } else if (layerManager.layers.every(l => l.isLoaded)) {
        resolve();
        return;
      }

      /* global setTimeout */
      setTimeout(onAnimationFrame, 50);
    };

    onAnimationFrame();
  });
}
