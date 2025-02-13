// src/components/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

export default function PrivateRoute({ component }) {
  const auth = getAuth();
  const user = auth.currentUser;

  return user ? component : <Navigate to="/login" />;
}
