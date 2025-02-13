// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { Box, Container, TextField, Button, Typography, Avatar, Alert } from "@mui/material";
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

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
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
      }
    };

    fetchUserData();
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      // Atualiza perfil no Firebase Auth
      await updateProfile(user, { displayName: name, photoURL });
      // Atualiza dados no Firestore
      await updateDoc(doc(firestore, "users", user.uid), { name, photoURL });
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
        <Typography variant="h5" sx={{ mt: 2 }}>
          Perfil
        </Typography>
      </Box>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
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
