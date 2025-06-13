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
    <path d="M9 8v13" />
    <path d="M9 13h7c2.76 0 5-2.24 5-5s-2.24-5-5-5H9" />
  </svg>
);
