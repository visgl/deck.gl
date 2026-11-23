// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/**
 * Creates a props object whose default `id` lives on the prototype, as layer props do.
 *
 * `props.id` reads the passed id or the default, but `Object.hasOwn(props, 'id')` is true only
 * when a source passed one. Wrappers such as React renderers rely on this to tell an id the app
 * passed from a class default, so the default must stay off the object itself.
 *
 * @param defaultId The id to use when none is passed
 * @param sources Objects to copy, in order. An `id` of `undefined` doesn't hide the default.
 */
export function createPropsWithDefaultId<PropsT extends {id?: string | null}>(
  defaultId: string | undefined,
  ...sources: (object | null | undefined)[]
): PropsT {
  const props: PropsT = Object.assign(Object.create({id: defaultId}), ...sources);
  if (props.id === undefined) {
    // Remove the own `undefined` so the default on the prototype shows through
    delete props.id;
  }
  return props;
}
