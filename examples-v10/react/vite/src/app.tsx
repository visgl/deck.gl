// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {Page} from './page';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5 // 5 minutes
    }
  }
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Page />
    </QueryClientProvider>
  );
}
