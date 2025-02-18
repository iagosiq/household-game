// src/pages/UserSelection.jsx
import React, { useState, useEffect, useContext } from "react";
import { Container, Box, Typography, List, ListItemButton, ListItemText, Button } from "@mui/material";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase-config";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { ActiveSubUserContext } from "../context/ActiveSubUserContext";

export default function UserSelection() {
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();
  const { updateActiveSubUser } = useContext(ActiveSubUserContext);
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
          // Obtenha o perfil principal (displayName ou email)
          const mainProfile = user.displayName || user.email || "Sem Nome";
          if (!subList.includes(mainProfile)) {
            subList.unshift(mainProfile);
          }
          setSubUsers(subList);
          if (!selectedSubUser && subList.length > 0) {
            setSelectedSubUser(subList[0]);
          }
          console.log("Subusuários carregados:", subList);
        } catch (error) {
          console.error("Erro ao buscar subusuários:", error);
        }
      }
    };
    fetchSubUsers();
  }, [user, selectedSubUser]);

  const handleSelect = (subUser) => {
    setSelectedSubUser(subUser);
    console.log("Perfil selecionado:", subUser);
  };

  const handleConfirm = () => {
    if (selectedSubUser) {
      console.log("Subusuário confirmado:", selectedSubUser);
      updateActiveSubUser(selectedSubUser);
      navigate("/dashboard");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" align="center" gutterBottom component="h1">
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
                  color: selectedSubUser === subUser ? "#1876D1" : "inherit",
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
