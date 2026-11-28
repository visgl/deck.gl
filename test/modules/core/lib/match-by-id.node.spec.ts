// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';

import {matchById} from '@deck.gl/core/lib/match-by-id';
import {log} from '@deck.gl/core';

const entry = (id: string, version = 0) => ({id, version});

test('matchById#pairs new entries with old entries by id', () => {
  const a = entry('a');
  const b = entry('b');
  const nextB = entry('b', 1);
  const c = entry('c');

  const {matches, removed} = matchById([a, b], [nextB, c]);

  expect(matches).toEqual([
    {item: nextB, previous: b, duplicate: false},
    {item: c, previous: undefined, duplicate: false}
  ]);
  expect(matches[0].previous, 'the old instance is returned').toBe(b);
  expect(removed, 'old entries whose id is gone').toEqual([a]);
});

test('matchById#keeps the first entry with an id and warns about the rest', () => {
  const warn = vi.spyOn(log, 'warn').mockReturnValue(() => {});
  try {
    const old = entry('a');
    const first = entry('a', 1);
    const second = entry('a', 2);

    const {matches, removed} = matchById([old], [first, second], 'widgets');

    expect(matches.map(match => match.duplicate)).toEqual([false, true]);
    expect(matches[0].previous, 'the first entry is matched').toBe(old);
    expect(removed).toEqual([]);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith('Multiple widgets with same id a');
  } finally {
    warn.mockRestore();
  }
});

test('matchById#marks a repeated instance by position', () => {
  const warn = vi.spyOn(log, 'warn').mockReturnValue(() => {});
  try {
    const shared = entry('shared');

    const {matches} = matchById([], [shared, shared]);

    expect(matches.map(match => match.duplicate)).toEqual([false, true]);
    expect(warn, 'no warning without a kind').not.toHaveBeenCalled();
  } finally {
    warn.mockRestore();
  }
});

test('matchById#matches the first of several old entries with an id', () => {
  const first = entry('a', 1);
  const second = entry('a', 2);

  const {matches, removed} = matchById([first, second], [entry('a', 3)]);

  expect(matches[0].previous).toBe(first);
  expect(removed).toEqual([]);

  expect(matchById([first, second], []).removed, 'every old entry with a removed id').toEqual([
    first,
    second
  ]);
});
