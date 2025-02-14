// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { auth, firestore } from "../firebase/firebase-config";
import { Container, Box, TextField, Button, Typography, Alert } from "@mui/material";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Buscar sub-usuários no Firestore
      const userDocRef = doc(firestore, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      let subList = [];
      if (userDoc.exists()) {
         subList = userDoc.data().subUsers || [];
         // Adicionar o nome principal se não estiver presente
         if (user.displayName && !subList.includes(user.displayName)) {
           subList.unshift(user.displayName);
         }
      }
      // Se houver mais de um perfil, redireciona para seleção, senão, para o Dashboard
      if (subList.length > 1) {
         navigate("/user-selection");
      } else {
         navigate("/dashboard");
      }
    } catch (err) {
      setError("Erro ao fazer login. Verifique seus dados.");
      console.error(err);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography component="h1" variant="h5" gutterBottom>
          Login
        </Typography>
        {error && <Alert severity="error" sx={{ width: "100%" }}>{error}</Alert>}
        <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Entrar
          </Button>
          <Typography variant="body2">
            Não tem conta? <a href="/register" style={{ color: "#1976d2" }}>Cadastre-se</a>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
