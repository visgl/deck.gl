// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import styled from 'styled-components';

const DemoContainer = styled.div`
  position: absolute;
  overflow: hidden !important;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  > header > h1 {
    display: none;
  }
`;

/** Passed to @docusaurus/plugin-content-docs to render the mdx content */
export default function DocItem({content}) {
  const MDXComponent = content;
  const {metadata} = content;

  if (metadata.id === 'index') {
    return (
      <div key="index">
        <MDXComponent />
      </div>
    );
  }

  return (
    <DemoContainer key="demo">
      <MDXComponent />
    </DemoContainer>
  );
}
