import React from "react";
import LoginForm from "../components/Login/LoginForm";
import "./LoginPage.css";

const LoginPage = () => {
  return (
    <main className="login-page" aria-labelledby="login-heading">
      <div className="login-container">
        <h1 id="login-heading">Bienvenido a<br />Dice and Diaries</h1>
        <p className="login-subtitle">Iniciar sesión</p>
        <LoginForm />
      </div>
    </main>
  );
};

export default LoginPage;