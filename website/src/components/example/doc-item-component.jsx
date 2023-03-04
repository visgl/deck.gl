import React from 'react';
import styled from 'styled-components';
import useBaseUrl from '@docusaurus/useBaseUrl';

const DemoContainer = styled.div`
  position: absolute;
  overflow: hidden !important;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  > h1 {
    display: none;
  }
`;

/** Passed to @docusaurus/plugin-content-docs to render the mdx content */
export default function ({content, route}) {
  const MDXComponent = content;
  const indexPath = useBaseUrl('/examples');

  if (route.path === indexPath) {
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
