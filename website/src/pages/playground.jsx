// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Suspense} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import useBaseUrl from '@docusaurus/useBaseUrl';

import Layout from '@theme/Layout';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  height: calc(100vh - 60px);
  overflow: hidden;
`;

// react-ace does not work on the server side
const App = React.lazy(() => import('@site/../examples/playground/src/app'));

export default function Playground() {
  const schemaUrl = useBaseUrl('/schema.generated.json');

  return (
    <Layout>
      <Container>
        <Suspense>
          <BrowserOnly>
            {() => <App schemaUrl={schemaUrl} />}
          </BrowserOnly>
        </Suspense>
      </Container>
    </Layout>
  );
}
