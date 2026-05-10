import React from "react";

const Card = ({ children, className = "", role, ...props }) => {
  return (
    <div className={`card ${className}`} role={role} {...props}>
      {children}
    </div>
  );
};

export default Card;