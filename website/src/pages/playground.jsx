import React, {Suspense} from 'react';
import Layout from '@theme/Layout';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: row;
  align-items: stretch;
  overflow: hidden;

  #left-pane {
    flex: 0 1 40%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
  #left-pane select {
    flex: 0 0 34px;
    padding: 5px 35px 5px 5px;
    font-size: 16px;
    border: 1px solid #ccc;
    appearance: none;
  }
  #editor {
    flex: 0 1 100%;
  }
  #right-pane {
    flex: 0 1 60%;
    position: relative;
  }
`;

// react-ace does not work on the server side
const App = React.lazy(() => import('@site/../examples/playground/src/app'));

export default function Playground() {
  return (
    <Layout>
      <Container>
        <Suspense>
          <App />
        </Suspense>
      </Container>
    </Layout>
  );
}
