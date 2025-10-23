import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function SectionLead({ children, className = '' }: Props) {
  return (
    <p className={`max-w-2xl text-base text-slate-500 ${className}`.trim()}>
      {children}
    </p>
  );
}
