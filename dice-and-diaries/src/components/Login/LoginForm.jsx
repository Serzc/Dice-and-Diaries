import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import FormInput from "./FormInput";
import Button from "../common/Button";

const LoginForm = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const switchMode = (next) => {
    setMode(next);
    setErrors({});
    setUsername("");
    setPassword("");
    setConfirmPassword("");
  };

  const validate = () => {
    const e = {};
    if (!username.trim()) e.username = "El nombre de usuario es obligatorio";
    if (!password)        e.password = "La contraseña es obligatoria";
    if (mode === "register") {
      if (password && password.length < 6) e.password = "La contraseña debe tener al menos 6 caracteres";
      if (password !== confirmPassword)    e.confirmPassword = "Las contraseñas no coinciden";
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    setIsLoading(true);
    try {
      if (mode === "login") {
        await login(username.trim(), password);
      } else {
        await register(username.trim(), password);
      }
      navigate("/");
    } catch (err) {
      setErrors({ general: err.message || "Error de conexión. Inténtelo de nuevo." });
    } finally {
      setIsLoading(false);
    }
  };

  const isRegister = mode === "register";

  return (
    <>
      <p className="login-subtitle">{isRegister ? "Crear cuenta" : "Iniciar sesión"}</p>

      <form onSubmit={handleSubmit} noValidate className="login-form">
        {errors.general && (
          <div className="alert alert-error" role="alert">{errors.general}</div>
        )}
        <FormInput
          label="Nombre de usuario"
          name="username"
          type="text"
          placeholder="Ingrese su nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={errors.username}
        />
        <FormInput
          label="Contraseña"
          name="password"
          type="password"
          placeholder={isRegister ? "Mínimo 6 caracteres" : "Ingrese su contraseña"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        {isRegister && (
          <FormInput
            label="Confirmar contraseña"
            name="confirmPassword"
            type="password"
            placeholder="Repita su contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
          />
        )}
        <Button type="submit" disabled={isLoading} ariaLabel={isRegister ? "Crear cuenta" : "Ingresar a la aplicación"}>
          {isLoading ? (isRegister ? "Creando..." : "Ingresando...") : (isRegister ? "Crear cuenta" : "Ingresar")}
        </Button>

        <p className="login-switch">
          {isRegister ? (
            <>¿Ya tienes cuenta?{" "}
              <button type="button" className="login-switch-btn" onClick={() => switchMode("login")}>
                Inicia sesión
              </button>
            </>
          ) : (
            <>¿No tienes cuenta?{" "}
              <button type="button" className="login-switch-btn" onClick={() => switchMode("register")}>
                Regístrate
              </button>
            </>
          )}
        </p>
      </form>
    </>
  );
};

export default LoginForm;
