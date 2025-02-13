// src/pages/CreateUser.jsx
import React, { useState } from "react";
import { Container, TextField, Button, Typography, Alert, Box } from "@mui/material";
import { getFunctions, httpsCallable } from "firebase/functions";

export default function CreateUser() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const functions = getFunctions();
  const createUserCallable = httpsCallable(functions, "createUser");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const result = await createUserCallable({
        email,
        password,
        displayName,
        birthdate, // opcional
      });
      setSuccess(`Usuário criado com sucesso! UID: ${result.data.uid}`);
      // Limpar os campos
      setDisplayName("");
      setEmail("");
      setPassword("");
      setBirthdate("");
    } catch (err) {
      setError(err.message || "Erro ao criar usuário. Tente novamente.");
      console.error("Erro ao criar usuário:", err);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Criar Novo Usuário
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Nome"
          variant="outlined"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
        <TextField
          label="Email"
          variant="outlined"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Senha"
          variant="outlined"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <TextField
          label="Data de Nascimento"
          variant="outlined"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
        />
        <Button type="submit" variant="contained">
          Criar Usuário
        </Button>
      </Box>
    </Container>
  );
}
