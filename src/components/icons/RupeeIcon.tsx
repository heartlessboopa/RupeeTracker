import type React from 'react';

interface RupeeIconProps extends React.SVGProps<SVGSVGElement> {}

export const RupeeIcon: React.FC<RupeeIconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M6 3h12" />
    <path d="M6 8h12" />
    <path d="M6 13h10c4.4182782 0 8-3.1340068 8-7v0c0 3.8659932-3.5817218 7-8 7H6" />
    <path d="M9 13L9 21" />
  </svg>
);
