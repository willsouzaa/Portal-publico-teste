import React from "react";

export const Slider: React.FC<any> = (props) => {
  // Minimal placeholder; for real interactions replace with Radix slider or similar
  return <input type="range" {...props} />;
};

export default Slider;
