import {useRef} from 'react';
import type {Ref} from 'react';
import {useIsomorphicLayoutEffect} from '../shared/use-isomorphic-layout-effect';

interface AttachedRef<Instance> {
  ref: Ref<Instance>;
  cleanup: (() => void) | undefined;
}

// Assigns an object ref or calls a callback ref, returning a React 19 callback-ref cleanup.
function assignRef<Instance>(ref: Ref<Instance>, value: Instance | null): (() => void) | undefined {
  if (typeof ref === 'function') {
    const cleanup = ref(value);
    return typeof cleanup === 'function' ? cleanup : undefined;
  }
  if (ref) {
    ref.current = value;
  }
  return undefined;
}

/**
 * Keeps a React 19 `ref` prop attached to a root's deck.gl instance.
 *
 * Returns a stable setter that the root calls with each instance and with `null` on
 * teardown. Like React, it detaches a replaced ref (calling its cleanup or passing
 * `null`) and attaches the replacement to the current instance. Repeating the current
 * instance does not detach and reattach the ref.
 *
 * Call it before the effects that call the setter, so a ref replaced in the same commit is
 * current when they run.
 */
export function useInstanceRef<Instance>(
  ref: Ref<Instance> | undefined
): (instance: Instance | null) => void {
  const latestRef = useRef(ref);
  const instance = useRef<Instance | null>(null);
  const attached = useRef<AttachedRef<Instance> | null>(null);
  const setInstance = useRef<((value: Instance | null) => void) | null>(null);

  function detach(): void {
    const current = attached.current;
    attached.current = null;
    if (current) {
      if (current.cleanup) {
        current.cleanup();
      } else {
        assignRef(current.ref, null);
      }
    }
  }

  function attach(): void {
    const target = latestRef.current;
    if (target && instance.current) {
      attached.current = {cleanup: assignRef(target, instance.current), ref: target};
    }
  }

  useIsomorphicLayoutEffect(() => {
    latestRef.current = ref;
    if (attached.current?.ref !== ref) {
      detach();
      attach();
    }
  }, [ref]);

  if (!setInstance.current) {
    setInstance.current = value => {
      if (value === instance.current && attached.current?.ref === latestRef.current) {
        return;
      }
      instance.current = value;
      detach();
      attach();
    };
  }

  return setInstance.current;
}
