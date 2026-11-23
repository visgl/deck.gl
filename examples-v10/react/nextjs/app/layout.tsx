// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Metadata} from 'next';
import 'maplibre-gl/dist/maplibre-gl.css';
import './maplibre.css';

export const metadata: Metadata = {
  description: 'deck.gl fiber renderer airports example with Next.js App Router',
  title: 'Airports Example - Next.js'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{margin: 0, overflow: 'hidden', padding: 0}}>{children}</body>
    </html>
  );
}
