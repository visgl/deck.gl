/* eslint import/namespace: ['error', { allowComputed: true }] */
import React, {useState} from 'react';
import styled from 'styled-components';
import {PanelContainer, PanelContent, PanelTitle, PanelExpander, SourceLink} from './styled';

import GenericInput from '../input';
import Spinner from '../spinner';

const InfoPanelContent = styled.div`
  hr {
    margin: 12px -24px;
  }
  a {
    text-decoration: none;
    display: inline;
    color: var(--ifm-color-primary);
  }
  p {
    margin-bottom: 16px;
  }
  .legend {
    display: inline-block;
    width: 12px;
    height: 12px;
  }
  .stat {
    text-transform: uppercase;
    font-size: 0.833em;

    b {
      display: block;
      font-size: 3em;
      font-weight: bold;
      line-height: 1.833;
    }
  }
  hr {
    border: none;
    background: var(--ifm-color-gray-400);
    height: 1px;
  }
  .layout {
    display: table;
    width: 100%;

    > * {
      display: table-cell !important;
    }
    .col-1-3 {
      width: 33.33%;
    }
    .col-1-2 {
      width: 50%;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
  }
`;

function InfoPanel({title, children, sourceLink}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <PanelContainer>
      <PanelTitle onClick={() => setIsExpanded(!isExpanded)}>
        <div>{title}</div>
        <PanelExpander $expanded={isExpanded}>{isExpanded ? '✕' : 'i'}</PanelExpander>
      </PanelTitle>
      <PanelContent $expanded={isExpanded}>{children}</PanelContent>
      <SourceLink $expanded={isExpanded} href={sourceLink} target="_new">
        View Code ↗
      </SourceLink>
    </PanelContainer>
  );
}

export default function ExampleInfoPanel({title, sourceLink, params, meta, children, updateParam}) {
  return (
    <InfoPanel title={title} sourceLink={sourceLink}>
      <InfoPanelContent>
        {children}

        {Object.keys(params).length > 0 && <hr />}

        {Object.keys(params)
          .sort()
          .map((name, i) => (
            <GenericInput
              key={`${i}-${name}`}
              name={name}
              {...params[name]}
              onChange={updateParam}
            />
          ))}
      </InfoPanelContent>

      <Spinner meta={meta} />
    </InfoPanel>
  );
}
