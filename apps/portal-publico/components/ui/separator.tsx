import React from "react";

export const Separator: React.FC<{ className?: string }> = ({ className }) => (
  <div className={className} style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
);

export default Separator;
