import * as React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

export function PlayIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      viewBox="0 0 16 16"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M5 3.5v9l7-4.5-7-4.5Z" fill="currentColor" />
    </svg>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      viewBox="0 0 16 16"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M5 2.5A1.5 1.5 0 0 1 6.5 1h5A1.5 1.5 0 0 1 13 2.5v7A1.5 1.5 0 0 1 11.5 11h-5A1.5 1.5 0 0 1 5 9.5v-7Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 5H3A1.5 1.5 0 0 0 1.5 6.5v6A1.5 1.5 0 0 0 3 14h5.5A1.5 1.5 0 0 0 10 12.5V12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SpinnerIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      viewBox="0 0 16 16"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g>
        <path
          d="M8 2a6 6 0 1 0 6 6"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.5"
        />
        <animateTransform
          attributeName="transform"
          dur="0.8s"
          from="0 8 8"
          repeatCount="indefinite"
          to="360 8 8"
          type="rotate"
        />
      </g>
    </svg>
  );
}
