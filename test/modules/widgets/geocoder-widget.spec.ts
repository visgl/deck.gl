// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, test, expect, vi} from 'vitest';
import {type MapViewState} from '@deck.gl/core';
import {
  _GeocoderWidget as GeocoderWidget,
  _CoordinatesGeocoder as CoordinatesGeocoder,
  _CurrentLocationGeocoder as CurrentLocationGeocoder
} from '@deck.gl/widgets';
import {WidgetTester} from './common';

let testInstance: WidgetTester<any> | undefined;

afterEach(() => {
  testInstance?.destroy();
  testInstance = undefined;
});

test('CoordinatesGeocoder.geocode - Parses decimal coordinates correctly', async () => {
  const cases = [
    {input: '34.0522, -118.2437', expected: {latitude: 34.0522, longitude: -118.2437}},
    {input: '-118.2437, 34.0522', expected: {longitude: -118.2437, latitude: 34.0522}},
    {input: '40.7128; -74.0060', expected: {latitude: 40.7128, longitude: -74.006}}
  ];

  for (const {input, expected} of cases) {
    const result = await CoordinatesGeocoder.geocode(input);
    expect(result, `geocode(${input})`).toEqual(expected);
  }
});

test('CoordinatesGeocoder.geocode - Handles DMS format correctly', async () => {
  const cases = [
    {
      input: '37°48\'00\"N, 122°25\'42\"W',
      expected: {latitude: 37.8, longitude: -122.42833333333333}
    },
    {
      input: '122°25\'42\"W; 37°48\'00\"N',
      expected: {longitude: -122.42833333333333, latitude: 37.8}
    }
  ];

  for (const {input, expected} of cases) {
    const result = await CoordinatesGeocoder.geocode(input);
    // Use toBeCloseTo for floating point comparisons
    expect(result?.latitude, `geocode(${input}) latitude`).toBeCloseTo(expected.latitude, 10);
    expect(result?.longitude, `geocode(${input}) longitude`).toBeCloseTo(expected.longitude, 10);
  }
});

test('CoordinatesGeocoder.geocode - Returns null for invalid inputs', async () => {
  const cases = [
    {input: 'not a coordinate', expected: null},
    {input: '1000, 1000', expected: null}, // Invalid values
    {input: 'onlyonevalue', expected: null}
  ];

  for (const {input, expected} of cases) {
    const result = await CoordinatesGeocoder.geocode(input);
    expect(result, `geocode(${input}) should be null`).toBe(expected);
  }
});

test('CoordinatesGeocoder.geocode - Parses mixed formats and boundary conditions', async () => {
  const cases = [
    {input: '85°, -180°', expected: {latitude: 85, longitude: -180}},
    {input: '85°0\'0\"N, 180°0\'0\"E', expected: {latitude: 85, longitude: 180}},
    {input: '90°0\'0\"S, 135°0\'0\"E', expected: {latitude: -90, longitude: 135}}
  ];

  for (const {input, expected} of cases) {
    const result = await CoordinatesGeocoder.geocode(input);
    expect(result, `geocode(${input})`).toEqual(expected);
  }
});

test('GeocoderWidget#flyTo calls onGeocode with coordinates', async () => {
  const onGeocode = vi.fn();
  const widget = new GeocoderWidget({onGeocode});

  testInstance = new WidgetTester({
    initialViewState: {
      longitude: 0,
      latitude: 0,
      zoom: 1
    },
    widgets: [widget]
  });

  await testInstance.idle();
  widget.flyTo({longitude: -122.4, latitude: 37.8, zoom: 12});

  expect(onGeocode).toHaveBeenCalledWith({
    viewId: 'default-view',
    coordinates: {longitude: -122.4, latitude: 37.8, zoom: 12}
  });
});

test('GeocoderWidget#responds to input change', async () => {
  let viewState: MapViewState = {
    longitude: -122.45,
    latitude: 37.78,
    zoom: 8
  };
  testInstance = new WidgetTester({
    initialViewState: viewState,
    onViewStateChange: (evt: any) => {
      viewState = evt.viewState;
    },
    widgets: [new GeocoderWidget()]
  });

  await testInstance.idle();
  const input = testInstance.findElements('.deck-widget-geocoder-input')[0] as HTMLInputElement;
  expect(input).toBeTruthy();

  input.value = '-122, 38';
  input.dispatchEvent(new InputEvent('input'));
  input.dispatchEvent(new KeyboardEvent('keypress', {key: 'Enter'}));

  await testInstance.idle();
  expect(viewState.longitude).toBe(-122);
  expect(viewState.latitude).toBe(38);
});

test('GeocoderWidget#getCurrentLocation flies to current location', async () => {
  let viewState: MapViewState = {
    longitude: 0,
    latitude: 0,
    zoom: 1
  };
  const onGeocode = vi.fn();
  const geocodeSpy = vi
    .spyOn(CurrentLocationGeocoder, 'geocode')
    .mockResolvedValue({longitude: -122.4, latitude: 37.8});

  const widget = new GeocoderWidget({onGeocode});
  testInstance = new WidgetTester({
    initialViewState: viewState,
    onViewStateChange: (evt: any) => {
      viewState = evt.viewState;
    },
    widgets: [widget]
  });

  await testInstance.idle();
  await widget.getCurrentLocation();

  expect(geocodeSpy).toHaveBeenCalledOnce();
  expect(onGeocode).toHaveBeenCalledWith({
    viewId: 'default-view',
    coordinates: {longitude: -122.4, latitude: 37.8, zoom: undefined}
  });
  expect(viewState.longitude).toBe(-122.4);
  expect(viewState.latitude).toBe(37.8);
});
