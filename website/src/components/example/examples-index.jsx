// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
// Note: this is internal API and may change in a future release
// https://github.com/facebook/docusaurus/discussions/7457
import {useDocsSidebar} from '@docusaurus/plugin-content-docs/client';
import useBaseUrl from '@docusaurus/useBaseUrl';

import {MainExamples, ExamplesGroup, ExampleCard, ExampleHeader, ExampleTitle} from './styled';

function renderItem(item, getThumbnail) {
  const imageUrl = useBaseUrl(getThumbnail(item));
  const {label, href} = item;

  return (
    <ExampleCard key={label} href={href}>
      <img width="100%" src={imageUrl} alt={label} />
      <ExampleTitle>
        <span>{label}</span>
      </ExampleTitle>
    </ExampleCard>
  );
}

/** Renders category headings and cards, including nested proposal groups. */
function renderCategory({label, items}, getThumbnail) {
  return [
    <ExampleHeader key={`${label}-header`}>{label}</ExampleHeader>,
    <ExamplesGroup key={label}>
      {items.filter(item => item.type !== 'category').map(item => renderItem(item, getThumbnail))}
    </ExamplesGroup>,
    ...items
      .filter(item => item.type === 'category')
      .flatMap(item => renderCategory(item, getThumbnail))
  ];
}

export default function ExamplesIndex({getThumbnail}) {
  const sidebar = useDocsSidebar();

  return (
    <MainExamples>
      {sidebar.items.map(item => {
        if (item.type === 'category') {
          return renderCategory(item, getThumbnail);
        }
        return null;
      })}
    </MainExamples>
  );
}
