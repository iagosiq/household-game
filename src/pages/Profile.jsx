// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { Container, Box, TextField, Button, Typography, Avatar, Alert } from "@mui/material";
import { getAuth, updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase-config";

export default function Profile() {
  const auth = getAuth();
  const user = auth.currentUser;

  const [name, setName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchUserData = async () => {
    if (!user) return;
    try {
      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setName(data.name || "");
        setPhotoURL(data.photoURL || "");
      }
    } catch (err) {
      console.error("Erro ao buscar dados do usuário:", err);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      // Atualiza o perfil no Firebase Auth
      await updateProfile(user, { displayName: name, photoURL });
      // Atualiza os dados no Firestore
      await updateDoc(doc(firestore, "users", user.uid), {
        name,
        photoURL,
      });
      setSuccess("Perfil atualizado com sucesso!");
    } catch (err) {
      setError("Erro ao atualizar perfil. Tente novamente.");
      console.error(err);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Box sx={{ textAlign: "center" }}>
        <Avatar src={photoURL} sx={{ width: 100, height: 100, margin: "0 auto" }} />
        <Typography variant="h5" gutterBottom>
          Perfil
        </Typography>
      </Box>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <Box component="form" onSubmit={handleUpdate} sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Nome"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="URL da Foto"
          variant="outlined"
          value={photoURL}
          onChange={(e) => setPhotoURL(e.target.value)}
          fullWidth
        />
        <Button type="submit" variant="contained">
          Atualizar Perfil
        </Button>
      </Box>
    </Container>
  );
}
