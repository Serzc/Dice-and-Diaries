import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "./FormInput";
import Button from "../common/Button";
import { loginUser } from "../../mock/db";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = "El nombre de usuario es obligatorio";
    if (!password) newErrors.password = "La contraseña es obligatoria";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsLoading(true);
    try {
      const user = await loginUser(username, password);
      if (user) {
        // Aquí luego manejarás el estado global de autenticación (contexto, Redux, etc.)
        navigate("/");
      } else {
        setErrors({ general: "Nombre de usuario o contraseña incorrectos" });
      }
    } catch (err) {
      setErrors({ general: "Error de conexión. Inténtelo de nuevo." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="login-form">
      {errors.general && (
        <div className="alert alert-error" role="alert">
          {errors.general}
        </div>
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
        placeholder="Ingrese su contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />
      <Button type="submit" disabled={isLoading} ariaLabel="Ingresar a la aplicación">
        {isLoading ? "Ingresando..." : "Ingresar"}
      </Button>
    </form>
  );
};

export default LoginForm;