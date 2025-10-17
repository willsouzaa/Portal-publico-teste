import React from "react";

export const Label: React.FC<{ className?: string; children?: React.ReactNode }> = ({ className, children }) => (
  <label className={className}>{children}</label>
);

export default Label;
