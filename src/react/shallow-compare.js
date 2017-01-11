import {areEqualShallow} from '../lib/utils';

/**
 * Does a shallow comparison for React props and state.
 */
export default function shallowCompare(instance, nextProps, nextState) {
  return (
    !areEqualShallow(instance.props, nextProps) ||
    !areEqualShallow(instance.state, nextState)
  );
}
