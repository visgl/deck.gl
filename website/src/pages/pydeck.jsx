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

const App = React.lazy(() => import('@site/../examples/pydeck/src/app'));

export default function PydeckPlayground() {
  const workerUrl = useBaseUrl('/workers/pyodide-worker.mjs');

  return (
    <Layout>
      <Container>
        <Suspense>
          <BrowserOnly>
            {() => <App workerUrl={workerUrl} />}
          </BrowserOnly>
        </Suspense>
      </Container>
    </Layout>
  );
}
