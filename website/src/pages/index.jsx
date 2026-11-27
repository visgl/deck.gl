// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useEffect, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import {PageMetadata} from '@docusaurus/theme-common';
import useBaseUrl from '@docusaurus/useBaseUrl';
import CodeBlock from '@theme/CodeBlock';
import Layout from '@theme/Layout';
import HeroMap from '../components/home/hero-map';

import styles from './index.module.css';

const heroImage = '/images/header-bg.jpg';
const description =
  'Build interactive maps, globes, and 3D visualizations with deck.gl, an open-source GPU framework for large datasets.';

const examples = [
  {
    title: 'Find road crash hotspots',
    description: 'Aggregate road collision records from Great Britain into 3D hexagons.',
    layer: 'HexagonLayer',
    image: 'hexagon-layer.webp',
    href: '/examples/hexagon-layer'
  },
  {
    title: 'Follow flights around the world',
    description: 'Explore global air traffic on a 3D globe.',
    layer: 'GlobeView',
    image: 'globe-view.webp',
    href: '/examples/globe-view'
  },
  {
    title: 'Explore Mount St. Helens',
    description: 'Drape satellite imagery over elevation data to see the volcano in 3D.',
    layer: 'TerrainLayer',
    image: 'terrain-layer.webp',
    href: '/examples/terrain-layer'
  }
];

const scatterplotCode = `import {Deck} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';

new Deck({
  initialViewState: {longitude: -74, latitude: 40.71, zoom: 12},
  controller: true,
  layers: [
    new ScatterplotLayer({
      id: 'locations',
      data: [{position: [-74, 40.71]}],
      getPosition: point => point.position,
      getRadius: 200,
      getFillColor: [0, 185, 155]
    })
  ]
});`;

function Arrow({diagonal = false}) {
  return <span aria-hidden="true">{diagonal ? '↗' : '→'}</span>;
}

function Hero() {
  const previewUrl = useBaseUrl('/examples-v10');
  const quickstartUrl = useBaseUrl('/docs/get-started/getting-started');

  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={styles.heroCopy}>
        <a className={styles.previewLink} href={previewUrl}>
          deck.gl v10 preview <Arrow />
        </a>
        <h1 id="home-title">
          Make big data <span>explorable.</span>
        </h1>
        <p>{description}</p>
        <div className={styles.actions}>
          <a className={styles.primaryButton} href={quickstartUrl}>
            Get started <Arrow />
          </a>
          <a className={styles.secondaryButton} href="#home-examples">
            Explore examples
          </a>
        </div>
      </div>
      <HeroMap />
    </section>
  );
}

/** Defers gallery artwork until its reserved space approaches the viewport. */
function ExampleScreenshot({src, width, height}) {
  const placeholder = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {rootMargin: '160px'}
    );
    observer.observe(placeholder.current);
    return () => observer.disconnect();
  }, []);

  const image = (
    <img
      src={src}
      alt=""
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      fetchpriority="low"
    />
  );

  return (
    <div className={styles.screenshot} ref={placeholder}>
      {visible && image}
      <noscript>{image}</noscript>
    </div>
  );
}

function ExampleCard({title, description, layer, image, href}) {
  const imageUrl = useBaseUrl(`/images/home/examples/${image}`);

  return (
    <li>
      <Link className={styles.exampleCard} to={href}>
        <ExampleScreenshot src={imageUrl} width={704} height={396} />
        <div className={styles.cardCopy}>
          <span className={styles.layerName}>{layer}</span>
          <h3>{title}</h3>
          <p>{description}</p>
          <span className={styles.cardArrow}>
            <Arrow diagonal />
          </span>
        </div>
      </Link>
    </li>
  );
}

function Examples() {
  return (
    <section id="home-examples" className={styles.examples} aria-labelledby="examples-title">
      <div className={styles.wrap}>
        <div className={styles.sectionHeading}>
          <h2 id="examples-title">See what you can build.</h2>
          <Link className={styles.textLink} to="/examples">
            Browse all examples <Arrow />
          </Link>
        </div>
        <ul className={styles.exampleGrid}>
          {examples.map(example => (
            <ExampleCard key={example.layer} {...example} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function Quickstart() {
  return (
    <section className={styles.quickstart} aria-labelledby="quickstart-title">
      <div className={`${styles.wrap} ${styles.quickstartGrid}`}>
        <div>
          <h2 id="quickstart-title">Start with one layer.</h2>
          <p>
            Map your data to positions, colors, and sizes. Combine layers for paths, polygons,
            terrain, and more in the same view.
          </p>
          <code className={styles.installCommand}>npm install @deck.gl/core @deck.gl/layers</code>
          <div className={styles.guideLinks}>
            <Link className={styles.textLink} to="/docs/get-started/using-standalone">
              JavaScript quickstart <Arrow />
            </Link>
            <Link className={styles.textLink} to="/docs/get-started/using-with-react">
              Use with React <Arrow />
            </Link>
          </div>
          <p className={styles.basemaps}>
            Use deck.gl on its own or{' '}
            <Link to="/docs/get-started/using-with-map">add a basemap</Link> from MapLibre, Mapbox,
            Google Maps, or ArcGIS.
          </p>
        </div>
        <div className={styles.codeSample}>
          <CodeBlock language="js" title="app.js">
            {scatterplotCode}
          </CodeBlock>
        </div>
      </div>
    </section>
  );
}

function ReleasePreview() {
  const imageUrl = useBaseUrl('/images/examples/v10/gpu-graph-explorer.jpg');

  return (
    <section className={styles.release} aria-labelledby="release-title">
      <div className={`${styles.wrap} ${styles.releasePanel}`}>
        <div className={styles.releaseCopy}>
          <h2 id="release-title">Preview deck.gl v10.</h2>
          <p>
            Stream Apache Arrow data as it arrives, shape it with SQL, and try new WebGPU compute
            workflows. Explore these capabilities in the experimental v10 gallery.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primaryButton} to="/examples-v10">
              Explore v10 examples <Arrow />
            </Link>
            <Link className={styles.secondaryButton} to="/docs/whats-new">
              Read what’s new
            </Link>
          </div>
        </div>
        <Link className={styles.releaseDemo} to="/examples-v10/v10/gpu-graph-explorer">
          <ExampleScreenshot src={imageUrl} width={1280} height={720} />
          <div className={styles.releaseCaption}>
            <span>
              GPU Graph Explorer <small>WebGPU required</small>
            </span>
            <Arrow diagonal />
          </div>
        </Link>
      </div>
    </section>
  );
}

/** Renders the homepage hero, quickstart, and featured examples. */
export default function IndexPage() {
  const showcaseUrl = useBaseUrl('/showcase');

  return (
    <Layout title="GPU-powered maps and data visualization" description={description}>
      <PageMetadata image={heroImage} />
      <main className={styles.home}>
        <Hero />
        <section className={styles.proof} aria-labelledby="proof-title">
          <div className={`${styles.wrap} ${styles.proofRow}`}>
            <h2 id="proof-title">Built with deck.gl</h2>
            <ul className={styles.projects}>
              <li>Kepler.gl</li>
              <li>SandDance</li>
              <li>Flowmap.blue</li>
              <li>ProPublica’s The Bad Bet</li>
            </ul>
            <a className={styles.textLink} href={showcaseUrl}>
              See the showcase <Arrow />
            </a>
          </div>
        </section>
        <Examples />
        <Quickstart />
        <ReleasePreview />
      </main>
    </Layout>
  );
}
