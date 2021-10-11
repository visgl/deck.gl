import React from 'react';
import {Home} from 'gatsby-theme-ocular/components';
import {withPrefix} from 'gatsby';
import styled from 'styled-components';

import HeroExample from './examples/home-demo';

const FeatureImage = styled.div`
position: absolute;
height: 100%;
width: 50%;
top: 0;
right: 0;
z-index: -1;
border-top: solid 200px transparent;
background-image: url(${withPrefix('/images/maps.jpg')});
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
  font: ${props => props.theme.typography.font700};
  margin: 24px 0 16px;
  position: relative;
}
h3 {
  font: ${props => props.theme.typography.font450};
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
  background: ${props => props.theme.colors.mono400};
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

export default class IndexPage extends React.Component {
  render() {
    return (
      <Home HeroExample={HeroExample} theme="light">
        <div style={{position: 'relative'}}>
          <FeatureImage />
          <TextContainer>
            <h2>
              deck.gl is a WebGL-powered framework for visual exploratory
              data analysis of large datasets.
            </h2>
            <hr className="short" />

            <h3>
              <img src={withPrefix('/images/icon-layers.svg')} />
              A Layered Approach to Data Visualization
            </h3>
            <p>
            deck.gl allows complex visualizations to be constructed by
            composing existing layers, and makes it easy to package and
            share new visualizations as reusable layers. We already offer
            a <a href={withPrefix('/docs/api-reference/layers')}>catalog of proven layers</a> and
            we have many more in the works.
            </p>

            <h3>
              <img src={withPrefix('/images/icon-high-precision.svg')} />
              High-Precision Computations in the GPU
            </h3>
            <p>
            By emulating 64 bit floating point computations in the GPU,
            deck.gl renders datasets with unparalleled accuracy and
            performance.
            </p>

            <h3>
              <img src={withPrefix('/images/icon-react.svg')} />
              Integrated with React framework
            </h3>
            <p>
            deck.gl is a great match with React, supporting
            efficient WebGL rendering under the Reactive programming
            paradigm. 
            </p>

            <h3>
              <img src={withPrefix('/images/icon-basemap.webp')} />
              Supporting all major basemaps with interleaving
            </h3>
            <p>
              You can use deck.gl without a basemap, but if you are representing geographic data
              you can use different libraries and providers such as Google Maps, Mapbox GL and others.
              <br> 
              deck.gl coordinates with the basemap supporting 2D and 3D visualizations.
            </p>

          </TextContainer>
        </div>
      </Home>
    );
  }
}
