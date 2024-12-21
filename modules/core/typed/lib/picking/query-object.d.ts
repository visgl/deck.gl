import type Layer from '../layer';
import type Viewport from '../../viewports/viewport';
import type {PickingColorDecoder} from '../../passes/pick-layers-pass';
export declare type PickedPixel = {
  pickedColor: Uint8Array | null;
  pickedLayer?: Layer;
  pickedViewports?: Viewport[];
  pickedX?: number;
  pickedY?: number;
  pickedObjectIndex: number;
};
/**
 * Pick at a specified pixel with a tolerance radius
 * Returns the closest object to the pixel in shape `{pickedColor, pickedLayer, pickedObjectIndex}`
 */
export declare function getClosestObject({
  pickedColors,
  decodePickingColor,
  deviceX,
  deviceY,
  deviceRadius,
  deviceRect
}: {
  pickedColors: Uint8Array;
  decodePickingColor: PickingColorDecoder;
  deviceX: number;
  deviceY: number;
  deviceRadius: number;
  deviceRect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}): PickedPixel;
/**
 * Examines a picking buffer for unique colors
 * Returns array of unique objects in shape `{x, y, pickedColor, pickedLayer, pickedObjectIndex}`
 */
export declare function getUniqueObjects({
  pickedColors,
  decodePickingColor
}: {
  pickedColors: Uint8Array;
  decodePickingColor: PickingColorDecoder;
}): PickedPixel[];
// # sourceMappingURL=query-object.d.ts.map
