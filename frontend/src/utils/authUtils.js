import React from "react";
import { Navigate } from "react-router-dom";

export const redirectIfLoggedIn = () => {
    if (localStorage.getItem("access_token") !== null) {
        window.location.href = "/"
      }
}

export const ProtectedManagerRoute = ({ children, roleRequired }) => {
  try {
    const userRole = localStorage.getItem("user_role");

    if (roleRequired && userRole !== roleRequired) {
      return <Navigate to="/" />;
    }

    return children;

  } catch (error) {
    console.error("Error, tried to access page without MANAGER role:", error);
    localStorage.clear();
    // return <Navigate to="/" />;
  }
};