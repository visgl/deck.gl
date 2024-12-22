export declare function validateProps(props: any): void;
export declare function diffProps(
  props: any,
  oldProps: any
): {
  dataChanged:
    | string
    | false
    | {
        startRow: number;
        endRow?: number;
      }[];
  propsChanged: string | false;
  updateTriggersChanged: Record<string, true> | false;
  extensionsChanged: boolean;
  transitionsChanged: Record<string, true> | false;
};
/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * @param {Object} opt.oldProps - object with old key/value pairs
 * @param {Object} opt.newProps - object with new key/value pairs
 * @param {Object} opt.ignoreProps={} - object, keys that should not be compared
 * @returns {null|String} - null when values of all keys are strictly equal.
 *   if unequal, returns a string explaining what changed.
 */
export declare function compareProps({
  newProps,
  oldProps,
  ignoreProps,
  propTypes,
  triggerName
}: {
  newProps: any;
  oldProps: any;
  ignoreProps?: {};
  propTypes?: {};
  triggerName?: string;
}): string | false;
// # sourceMappingURL=props.d.ts.map
