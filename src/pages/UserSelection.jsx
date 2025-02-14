// src/pages/UserSelection.jsx
import React, { useState, useEffect } from "react";
import { Container, Box, Typography, List, ListItem, ListItemText, Button } from "@mui/material";
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
    // Busca os sub-usuários do documento do usuário no Firestore
    const fetchSubUsers = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(firestore, "users", user.uid));
          if (userDoc.exists()) {
            // Assume que os sub-usuários estão armazenados em um array chamado 'subUsers'
            setSubUsers(userDoc.data().subUsers || []);
          }
        } catch (error) {
          console.error("Erro ao buscar sub-usuários:", error);
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
      // Armazena o sub-usuário selecionado (aqui usamos o localStorage; em um app maior, pode ser via Context)
      localStorage.setItem("activeSubUser", selectedSubUser);
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
          Nenhum sub-usuário encontrado. Por favor, configure seus perfis.
        </Typography>
      ) : (
        <Box>
          <List>
            {subUsers.map((subUser, index) => (
              <ListItem
                key={index}
                button
                selected={selectedSubUser === subUser}
                onClick={() => handleSelect(subUser)}
              >
                <ListItemText primary={subUser} />
              </ListItem>
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
