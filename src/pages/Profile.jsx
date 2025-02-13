// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { Container, Box, TextField, Button, Typography, Alert } from "@mui/material";
import { getAuth, updateEmail, updatePassword, updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase-config";

export default function Profile() {
  const auth = getAuth();
  const user = auth.currentUser;

  // Estados para os campos do perfil
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          // Tenta buscar os dados adicionais do usuário no Firestore
          const userDoc = await getDoc(doc(firestore, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setName(data.name || user.displayName || "");
            setEmail(data.email || user.email || "");
            setBirthdate(data.birthdate || ""); // Supondo que seja armazenado no formato YYYY-MM-DD
          } else {
            // Se não houver documento no Firestore, usa os dados do Auth
            setName(user.displayName || "");
            setEmail(user.email || "");
          }
        } catch (err) {
          console.error("Erro ao buscar dados do usuário:", err);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      // Se o email foi alterado, atualiza no Auth
      if (email !== user.email) {
        await updateEmail(user, email);
      }
      // Se a senha foi preenchida, atualiza a senha
      if (password) {
        await updatePassword(user, password);
      }
      // Atualiza o nome no Auth (se houver alteração)
      if (name !== user.displayName) {
        await updateProfile(user, { displayName: name });
      }
      // Atualiza os dados adicionais no Firestore (nome, email e data de nascimento)
      await updateDoc(doc(firestore, "users", user.uid), {
        name,
        email,
        birthdate,
      });
      setSuccess("Perfil atualizado com sucesso!");
    } catch (err) {
      setError("Erro ao atualizar perfil. Tente novamente.");
      console.error("Erro de atualização:", err);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Editar Perfil
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Box component="form" onSubmit={handleUpdate} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Nome"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Email"
          variant="outlined"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Senha (deixe em branco se não alterar)"
          variant="outlined"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
        />
        <TextField
          label="Data de Nascimento"
          variant="outlined"
          type="date"
          InputLabelProps={{
            shrink: true,
          }}
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          fullWidth
          required
        />
        <Button type="submit" variant="contained">
          Atualizar Perfil
        </Button>
      </Box>
    </Container>
  );
}
