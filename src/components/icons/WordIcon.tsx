
import React from 'react';

const WordIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    {...props}
  >
    <path
      fill="#2A5699"
      d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
    />
    <path fill="#FFFFFF" d="M13 9H18L13 4V9Z" />
    <path
      fill="#B3C7E3"
      d="M7.5 12.5H16.5V13.5H7.5V12.5ZM7.5 15.5H16.5V16.5H7.5V15.5ZM7.5 18.5H13.5V19.5H7.5V18.5Z"
    />
  </svg>
);

export default WordIcon;
