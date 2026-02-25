// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import type {JSX, ComponentChildren} from 'preact';
import {useEffect, useRef} from 'preact/hooks';

export type UserContentProps = JSX.HTMLAttributes<HTMLDivElement> & {
  text?: string;
  html?: string;
  element?: HTMLElement | null;
};

export const UserContent = ({text, html, element, ...props}: UserContentProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && element) {
      containerRef.current.append(element);
    }
    return () => {
      element?.remove();
    };
  }, [element]);

  return (
    <div ref={containerRef} {...props} dangerouslySetInnerHTML={html ? {__html: html} : undefined}>
      {text}
    </div>
  );
};
