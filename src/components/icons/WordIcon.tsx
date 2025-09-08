
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
      fill="#FFFFFF"
      d="M15.5 13.4L14.7 15.8H13.3L12.5 13.4C12.3 12.8 12.1 12.2 12.1 11.7C12.1 11.1 12.1 10.6 12.1 10.1H12.2C12.4 10.7 12.6 11.2 12.8 11.8L13.8 14.3L14.8 11.8C15 11.2 15.2 10.7 15.3 10.1H15.4C15.4 10.6 15.4 11.1 15.4 11.7C15.4 12.2 15.7 12.8 15.5 13.4ZM9.3 18H7.5V10.1H9.3V18Z"
    />
  </svg>
);

export default WordIcon;
