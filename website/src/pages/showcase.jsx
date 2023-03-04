import React from 'react';
import Layout from '@theme/Layout';
import styled from 'styled-components';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {joinPath} from '../utils/data-utils';

import items from '../../showcase.json';

const ShowcaseContainer = styled.div`
  padding: 60px 12px;
  max-width: 800px;
  margin: 0 auto;
  font-size: 14px;

  @media screen and (max-width: 600px) {
    padding: 12px;
  }
`;

const Thumbnail = styled.div`
  cursor: pointer;
  position: relative;
  width: 32%;
  display: inline-block;
  line-height: 0;

  img {
    transition: opacity 0.4s;
    width: 100%;
  }
  > div:before,
  > div:after {
    display: block;
    z-index: 1;
    position: absolute;
    transition: opacity 0.4s;
    opacity: 0;
    text-align: center;
    pointer-events: none;
    box-sizing: border-box;
    line-height: 1.5;
  }
  > div:before {
    content: attr(data-title);
    font-size: 1.4em;
    font-weight: 100;
    width: 100%;
    padding: 12%;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
  }
  > div:after {
    font-size: 0.833em;
    content: attr(data-name);
    padding: 5%;
    left: 0;
    width: 90%;
    height: 90%;
    margin: 5%;
    top: 0;
    left: 0;
    border: solid 2px;
    border-color: $primary;
    box-sizing: border-box;
  }
  > div:hover img {
    opacity: 0.2;
  }
  > div:hover:before,
  > div:hover:after {
    opacity: 1;
  }
  @media screen and (max-width: 720px) {
    width: 49%;
  }
  @media screen and (max-width: 480px) {
    width: 100%;
  }
`;

const ProjectInfo = styled.div`
  position: relative;
  width: 67%;
  height: 0;
  padding-top: 32%;
  display: inline-block;
  line-height: 1.5;
  padding-left: 24px;
  vertical-align: top;
  position: relative;
  background: #eee;
  margin-left: -4px;

  a {
    text-decoration: none;
    color: val(--ifm-color-black);
  }
  h2 {
    color: #111 !important;
  }
  > div {
    position: absolute;
    top: 12px;
    left: 20px;
    right: 20px;
    bottom: 12px;
    overflow: hidden;
  }
  @media screen and (max-width: 720px) {
    width: 50%;
    padding-top: 49%;
  }
  @media screen and (max-width: 480px) {
    display: none;
  }
`;

function renderLink(label, url, index) {
  const separator = index > 0 ? ' | ' : '';
  const prefix = label.search(/[A-Z0-9]\w+/);

  return (
    <span key={index}>
      {separator}
      {label.slice(0, prefix)}
      <a href={url} target="_blank" rel="noopener noreferrer">
        {label.slice(prefix)}
      </a>
    </span>
  );
}

export default function Showcase() {
  const baseUrl = useBaseUrl('/');

  return (
    <Layout title="Showcase" description="Projects built with deck.gl">
      <ShowcaseContainer>
        <p>
          <i>
            Would you like us to feature your project?
            <a href="https://github.com/visgl/deck.gl/issues"> Let us know!</a>
          </i>
        </p>

        {items.map(({name, url, image, links, description}) => (
          <div key={name}>
            <Thumbnail>
              <div data-title={name}>
                <a href={url}>
                  <img src={joinPath(baseUrl, image)} />
                </a>
              </div>
            </Thumbnail>

            <ProjectInfo>
              <div>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <h2>{name}</h2>
                </a>
                <p>{Object.keys(links).map((label, i) => renderLink(label, links[label], i))}</p>
                <p>{description}</p>
              </div>
            </ProjectInfo>
          </div>
        ))}
      </ShowcaseContainer>
    </Layout>
  );
}
