declare type NestedArray<T> = (T | NestedArray<T>)[];
/**
 * Flattens a nested array into a single level array,
 * or a single value into an array with one value
 * @example flatten([[1, [2]], [3], 4]) => [1, 2, 3, 4]
 * @example flatten(1) => [1]
 * @param array The array to flatten.
 * @param filter= - Optional predicate called on each `value` to
 *   determine if it should be included (pushed onto) the resulting array.
 * @return Returns the new flattened array (new array or `result` if provided)
 */
export declare function flatten<T>(
  array: T | NestedArray<T>,
  filter?: (element: T) => boolean
): T[];
/** Uses copyWithin to significantly speed up typed array value filling */
export declare function fillArray({
  target,
  source,
  start,
  count
}: {
  target: any;
  source: any;
  start?: number;
  count?: number;
}): any;
export {};
// # sourceMappingURL=flatten.d.ts.map
