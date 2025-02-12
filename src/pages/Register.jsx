// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, firestore } from "../firebase/firebase-config";
import { doc, setDoc } from "firebase/firestore";
import { Container, Box, TextField, Button, Typography, Alert } from "@mui/material";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: name });
      // Cria um documento na coleção "users" com informações adicionais
      await setDoc(doc(firestore, "users", user.uid), {
        name,
        email,
        role: "user",  // ou "admin" se for o usuário principal
        createdAt: new Date(),
      });
      navigate("/dashboard");
    } catch (err) {
      setError("Erro ao criar conta. Tente novamente.");
      console.error(err);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography component="h1" variant="h5" gutterBottom>
          Cadastro
        </Typography>
        {error && <Alert severity="error" sx={{ width: "100%" }}>{error}</Alert>}
        <Box component="form" onSubmit={handleRegister} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
            Cadastrar
          </Button>
          <Typography variant="body2">
            Já tem conta? <a href="/login" style={{ color: "#1976d2" }}>Faça login</a>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
