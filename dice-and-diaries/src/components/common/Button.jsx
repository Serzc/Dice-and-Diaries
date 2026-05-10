import React from "react";

/**
 * Botón genérico con soporte para accesibilidad.
 * @param {React.ReactNode} children
 * @param {function} onClick
 * @param {string} [type="button"]
 * @param {boolean} [disabled]
 * @param {string} [ariaLabel]
 */
const Button = ({ children, onClick, type = "button", disabled = false, ariaLabel }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || children}
      className="primary-button"
    >
      {children}
    </button>
  );
};

export default Button;