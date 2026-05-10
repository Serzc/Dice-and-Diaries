import React from "react";

/**
 * Campo de formulario con label accesible.
 * @param {string} label - Texto del label.
 * @param {string} name - Nombre del campo (id y name).
 * @param {string} type - Tipo de input (text, password, etc.).
 * @param {string} placeholder
 * @param {string} value
 * @param {function} onChange
 * @param {string} [error] - Mensaje de error opcional.
 */
const FormInput = ({ label, name, type, placeholder, value, onChange, error }) => {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-describedby={error ? `${name}-error` : undefined}
        aria-invalid={error ? "true" : undefined}
      />
      {error && (
        <span id={`${name}-error`} className="error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default FormInput;