// src/pages/UserSelection.jsx
import React, { useState, useEffect } from "react";
import { Container, Box, Typography, List, ListItemButton, ListItemText, Button } from "@mui/material";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase-config";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function UserSelection() {
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();
  const [subUsers, setSubUsers] = useState([]);
  const [selectedSubUser, setSelectedSubUser] = useState(null);

  useEffect(() => {
    const fetchSubUsers = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(firestore, "users", user.uid));
          let subList = [];
          if (userDoc.exists()) {
            subList = userDoc.data().subUsers || [];
          }
          // Adiciona o nome principal (displayName ou email) se não estiver presente
          const mainProfile = user.displayName || user.email || "Sem Nome";
          if (!subList.includes(mainProfile)) {
            subList.unshift(mainProfile);
          }
          setSubUsers(subList);
        } catch (error) {
          console.error("Erro ao buscar subusuários:", error);
        }
      }
    };
    fetchSubUsers();
  }, [user]);

  const handleSelect = (subUser) => {
    setSelectedSubUser(subUser);
  };

  const handleConfirm = () => {
    if (selectedSubUser) {
      // Armazena o subusuário selecionado (como objeto JSON) e redireciona
      localStorage.setItem("activeSubUser", JSON.stringify({ name: selectedSubUser }));
      navigate("/dashboard");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Selecione seu perfil
      </Typography>
      {subUsers.length === 0 ? (
        <Typography variant="body1" align="center">
          Nenhum subusuário encontrado. Por favor, configure seus perfis.
        </Typography>
      ) : (
        <Box>
          <List>
            {subUsers.map((subUser, index) => (
              <ListItemButton
                key={index}
                selected={selectedSubUser === subUser}
                onClick={() => handleSelect(subUser)}
                sx={{
                  backgroundColor: selectedSubUser === subUser ? "primary.main" : "inherit",
                  color: selectedSubUser === subUser ? "primary.contrastText" : "inherit",
                  "&:hover": { backgroundColor: "primary.light" },
                  mb: 1,
                  borderRadius: 1,
                }}
              >
                <ListItemText primary={subUser} />
              </ListItemButton>
            ))}
          </List>
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Button variant="contained" disabled={!selectedSubUser} onClick={handleConfirm}>
              Confirmar Seleção
            </Button>
          </Box>
        </Box>
      )}
    </Container>
  );
}
