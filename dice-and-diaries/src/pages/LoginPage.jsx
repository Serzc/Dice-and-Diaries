import React from "react";
import LoginForm from "../components/Login/LoginForm";
import "./LoginPage.css";

const LoginPage = () => {
  return (
    <main className="login-page" aria-labelledby="login-heading">
      <div className="login-container">
        <div className="login-brand">
          <p className="login-welcome">Bienvenido a</p>
          <h1 id="login-heading"><span className="brand-pill">Dice and Diaries</span></h1>
        </div>
        <LoginForm />
      </div>
    </main>
  );
};

export default LoginPage;