// This file is no longer used as the Rupee symbol is now directly rendered as text.
// You can safely delete this file if it's not referenced elsewhere.
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
    <path d="M9 13h7.5a4.5 4.5 0 1 1 0 9H9" />
    <path d="m9 8 5 5" />
    <path d="m14 13-5 5" />
  </svg>
);
