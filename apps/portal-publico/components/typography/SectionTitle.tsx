import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function SectionTitle({ children, className = '' }: Props) {
  return (
    <h2 className={`text-3xl font-semibold text-primary-900 ${className}`.trim()}>
      {children}
    </h2>
  );
}
