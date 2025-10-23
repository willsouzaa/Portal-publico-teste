import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Eyebrow({ children, className = '' }: Props) {
  return (
    <span className={`text-xs font-semibold uppercase tracking-[0.4em] text-secondary ${className}`.trim()}>
      {children}
    </span>
  );
}
