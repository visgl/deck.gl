// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {transformParagraph} from '@deck.gl/layers/text-layer/utils';
import {DEFAULT_FONT_SETTINGS} from '@deck.gl/layers/text-layer/font-atlas-manager';

const DEFAULT_CHAR_SET = DEFAULT_FONT_SETTINGS.characterSet;

function generateText(len) {
  const word = [];
  for (let i = 0; i < len; i++) {
    const index = Math.min(
      DEFAULT_CHAR_SET.length - 1,
      Math.floor(Math.random() * DEFAULT_CHAR_SET.length)
    );
    word.push(DEFAULT_CHAR_SET[index]);
  }
  return word.join('');
}

function generateParagraph(count) {
  const textArray = [];
  for (let i = 0; i < count; i++) {
    // generate a word with len 2 - 10
    const len = Math.max(2, Math.floor(Math.random() * 10));
    const text = generateText(len);
    textArray.push(text);
  }

  return textArray.join('');
}

// add tests
const TEXT1K = generateParagraph(1e3);
const TEXT10K = generateParagraph(1e4);
const TEXT25K = generateParagraph(2.5e4);
const TEXT50K = generateParagraph(5e4);

const mapping = {};

let i = 0;
for (const c of DEFAULT_CHAR_SET) {
  mapping[c] = {
    x: i * 24,
    y: i * 24,
    width: 24,
    height: 24,
    mask: true
  };
  i++;
}

const transformCharacter = c => c;
const lineHeight = 1.1;
const maxWidth = 100;

export default function textAutoWrappingBench(suite) {
  return suite
    .group('text-layer-auto-wrapping')
    .add('1K break-word', () => {
      transformParagraph(TEXT1K, lineHeight, 'break-word', maxWidth, mapping, transformCharacter);
    })
    .add('10K break-word', () => {
      transformParagraph(TEXT10K, lineHeight, 'break-word', maxWidth, mapping, transformCharacter);
    })
    .add('25K break-word', () => {
      transformParagraph(TEXT25K, lineHeight, 'break-word', maxWidth, mapping, transformCharacter);
    })
    .add('50K break-word', () => {
      transformParagraph(TEXT50K, lineHeight, 'break-word', maxWidth, mapping, transformCharacter);
    });
}
