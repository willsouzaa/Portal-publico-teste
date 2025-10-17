"use client";

import React from "react";

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (value: boolean | 'indeterminate' | null | undefined) => void;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onCheckedChange, className }) => {
  return (
    <input
      type="checkbox"
      checked={Boolean(checked)}
      onChange={(e) => onCheckedChange && onCheckedChange(e.target.checked)}
      className={className}
    />
  );
};

export default Checkbox;
