import React from "react";
import "./Button.css"; // your styles here

const Button = React.forwardRef(
  ({ className = "", variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? "span" : "button";

    return (
      <Comp
        ref={ref}
        className={`btn ${variant} ${size} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
