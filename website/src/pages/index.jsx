// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {Home} from '../components';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styled from 'styled-components';
import Layout from '@theme/Layout';

import HeroExample from '../examples/home-demo';

const FeatureImage = styled.div`
  position: absolute;
  height: 100%;
  width: 50%;
  top: 0;
  right: 0;
  z-index: -1;
  border-top: solid 200px transparent;
  background-image: url(${props => props.src});
  background-size: contain;
  background-repeat: no-repeat;
  background-position: right top;

  @media screen and (max-width: 768px) {
    display: none;
  }
`;

const TextContainer = styled.div`
  max-width: 800px;
  padding: 64px 112px;
  width: 70%;
  font-size: 14px;

  h2 {
    font: bold 32px/48px;
    margin: 24px 0 16px;
    position: relative;
  }
  h3 {
    font: bold 16px/24px;
    margin: 16px 0 0;
    position: relative;
  }
  h3 > img {
    position: absolute;
    top: -4px;
    width: 36px;
    left: -48px;
  }
  hr {
    border: none;
    background: #e1e8f0;
    height: 1px;
    margin: 24px 0 0;
    width: 32px;
    height: 2px;
  }
  @media screen and (max-width: 768px) {
    max-width: 100%;
    width: 100%;
    padding: 48px 48px 48px 80px;
  }
`;

export default function IndexPage() {
  const baseUrl = useBaseUrl('/');

  return (
    <Layout title="Home" description="deck.gl">
      <Home HeroExample={HeroExample}>
        <div style={{position: 'relative'}}>
          <FeatureImage src={`${baseUrl}images/maps.jpg`} />
          <TextContainer>
            <h2>
              deck.gl is a GPU-powered framework for visual exploratory data analysis of large
              datasets.
            </h2>
            <hr className="short" />

            <h3>
              <img src={`${baseUrl}images/icon-layers.svg`} />A Layered Approach to Data
              Visualization
            </h3>
            <p>
              deck.gl allows complex visualizations to be constructed by composing existing layers,
              and makes it easy to package and share new visualizations as reusable layers. We
              already offer a{' '}
              <a href={`${baseUrl}docs/api-reference/layers`}>catalog of proven layers</a> and we
              have many more in the works.
            </p>

            <h3>
              <img src={`${baseUrl}images/icon-high-precision.svg`} />
              High-Precision Computations in the GPU
            </h3>
            <p>
              By emulating 64 bit floating point computations in the GPU, deck.gl renders datasets
              with unparalleled accuracy and performance.
            </p>

            <h3>
              <img src={`${baseUrl}images/icon-react.svg`} />
              React Friendly
            </h3>
            <p>
              deck.gl APIs are designed to reflect the reactive programming paradigm. Whether using
              Vanilla JS or the React interface, it can handle efficient WebGL2/WebGPU rendering under heavy
              data load.
            </p>

            <h3>
              <img src={`${baseUrl}images/icon-basemap.webp`} />
              Integration with Base Map Providers
            </h3>
            <p>
              While deck.gl works standalone without a base map, it plays nicely with your favorite
              base map libraries such as Google Maps, Mapbox, ArcGIS, MapLibre, and more. Where the base map
              library permits, deck.gl may interleave with 3D map layers to create seamless
              visualizations.
            </p>
          </TextContainer>
        </div>
      </Home>
    </Layout>
  );
}
