import React from "react";
import "./Badge.css";

function Badge({ className = "", variant = "default", children, ...props }) {
  return (
    <span className={`badge ${variant} ${className}`} {...props}>
      {children}
    </span>
  );
}

export { Badge };
