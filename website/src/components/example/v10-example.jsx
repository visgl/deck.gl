// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

/** Embeds a v10 example with its standalone controls and graphics device lifecycle. */
export default function V10Example({id, title}) {
  const sourceUrl = useBaseUrl(`/v10-examples/${id}/index.html`);
  return (
    <iframe
      key={id}
      title={`${title} interactive example`}
      src={sourceUrl}
      allow="fullscreen"
      style={{position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0}}
    />
  );
}
