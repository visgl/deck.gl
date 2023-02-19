import styled from 'styled-components';
import {isMobile} from '../common';

export const Banner = styled.section`
  position: relative;
  height: 30rem;
  background: var(--ifm-color-gray-400);
  color: var(--ifm-color-gray-900);
  z-index: 0;
  ${isMobile} {
    height: 80vh;
  }
`;

export const Container = styled.div`
  position: relative;
  padding: 2rem;
  max-width: 80rem;
  width: 100%;
  height: 100%;
  margin: 0;
`;

export const BannerContainer = styled(Container)`
  position: absolute;
  bottom: 0;
  height: auto;
  padding-left: 4rem;
  z-index: 0;
  pointer-events: none;
`;

export const HeroExampleContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
`;

export const Section = styled.section`
  &:nth-child(2n + 1) {
    background: var(--ifm-color-gray-300);
  }
`;

export const ProjectName = styled.h1`
  font-size: 5em;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 4px;
  font-weight: 700;
  margin: 0;
  margin-bottom: 16px;
`;

export const GetStartedLink = styled.a`
  pointer-events: all;
  font-size: 12px;
  line-height: 44px;
  letter-spacing: 2px;
  font-weight: bold;
  margin: 24px 0;
  padding: 0 4rem;
  pointer-events: all;
  display: inline-block;
  text-decoration: none;
  transition: background-color 250ms ease-in, color 250ms ease-in;
  border: solid 2px var(--ifm-color-primary);
  color: var(--ifm-color-gray-900);
  border-image: linear-gradient(
    to right,
    var(--ifm-color-gray-700) 0%,
    var(--ifm-color-gray-400) 100%
  );
  border-image-slice: 2;
  &:visited {
    color: var(--ifm-color-gray-900);
  }
  &:active {
    color: var(--ifm-color-white);
  }
  &:hover {
    color: var(--ifm-color-white);
    background-color: var(--ifm-color-primary);
  }
`;
