import {describe, expect, it} from 'vitest';

import {hasSameConfigProperties} from '../has-same-config-properties';

describe('hasSameConfigProperties', () => {
  it('returns true for the same object', () => {
    const config = {controller: true};

    expect(hasSameConfigProperties(config, config)).toBe(true);
  });

  it('returns true for distinct objects with the same shallow properties', () => {
    const viewState = {latitude: 0, longitude: 0};
    const callback = () => undefined;

    expect(
      hasSameConfigProperties(
        {controller: true, onViewStateChange: callback, viewState},
        {controller: true, onViewStateChange: callback, viewState}
      )
    ).toBe(true);
  });

  it('returns false when a shallow property value changes', () => {
    expect(
      hasSameConfigProperties(
        {initialViewState: {latitude: 0, longitude: 0}},
        {initialViewState: {latitude: 0, longitude: 0}}
      )
    ).toBe(false);
  });

  it.each([
    {
      description: 'a property is added',
      other: {controller: true, debug: true},
      value: {controller: true}
    },
    {
      description: 'a property is removed',
      other: {controller: true},
      value: {controller: true, debug: true}
    }
  ])('returns false when $description', ({other, value}) => {
    expect(hasSameConfigProperties(value, other)).toBe(false);
  });

  it('uses Object.is semantics for property values', () => {
    expect(hasSameConfigProperties({value: Number.NaN}, {value: Number.NaN})).toBe(true);
    expect(hasSameConfigProperties({value: -0}, {value: 0})).toBe(false);
  });

  it('does not treat inherited properties as configuration properties', () => {
    const inherited = Object.create({controller: true}) as {controller?: boolean};

    expect(hasSameConfigProperties({controller: true}, inherited)).toBe(false);
  });
});
