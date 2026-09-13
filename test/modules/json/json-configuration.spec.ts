// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

import {JSONConfiguration} from '@deck.gl/json';
import {JSON_CONFIGURATION} from './json-configuration-for-deck';

test('JSONConfiguration#import', () => {
  expect(JSONConfiguration, 'JSONConfiguration imported').toBeTruthy();
});

test('JSONConfiguration#create', () => {
  const configuration = new JSONConfiguration(JSON_CONFIGURATION);
  expect(configuration, 'JSONConfiguration created').toBeTruthy();
});

test('JSONConfiguration#merge', () => {
  const postProcessConvertedJson = json => ({...json, tagged: true});
  const configuration = new JSONConfiguration({
    classes: {RootClass: class RootClass {}},
    convertFunction: value => () => value
  });

  configuration.merge({
    functions: {sum: ({left, right}) => left + right},
    postProcessConvertedJson
  });

  expect(configuration.config.classes.RootClass, 'classes merged').toBeTruthy();
  expect(configuration.config.functions.sum({left: 1, right: 2}), 'functions merged').toBe(3);
  expect(configuration.convertFunction('x')({}), 'convertFunction merged').toBe('x');
  expect(configuration.postProcessConvertedJson({}), 'postProcessConvertedJson merged').toEqual({
    tagged: true
  });
});

test('JSONConfiguration#getProps', () => {
  const preProcessClassProps = (_Class, props) => ({...props, processed: true});
  const configuration = new JSONConfiguration({
    classes: {RootClass: class RootClass {}},
    functions: {identity: ({value}) => value},
    preProcessClassProps
  });

  const props = configuration.getProps();

  expect(props.classes?.RootClass, 'getProps should include config values').toBeTruthy();
  expect(props.functions?.identity({value: 7}), 'getProps should include merged functions').toBe(7);
  expect(props.preProcessClassProps, 'getProps should include hooks').toBe(preProcessClassProps);
});
