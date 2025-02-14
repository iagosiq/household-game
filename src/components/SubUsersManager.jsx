// src/components/SubUsersManager.jsx
// Este componente permite que o usuário gerencie os sub-usuários (ex.: perfis adicionais)
// Ele carrega a lista de sub-usuários do documento do usuário no Firestore e permite adicionar e remover nomes.

import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase-config"; // Ajuste o caminho conforme sua estrutura
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Box, TextField, Button, Typography, List, ListItem, ListItemText, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const SubUsersManager = ({ userId }) => {
  const [subUsers, setSubUsers] = useState([]);
  const [newSubUser, setNewSubUser] = useState("");

  // Carrega os sub-usuários do Firestore ao montar o componente
  useEffect(() => {
    const fetchSubUsers = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          setSubUsers(userDoc.data().subUsers || []);
        }
      } catch (error) {
        console.error("Erro ao buscar sub-usuários:", error);
      }
    };
    if (userId) fetchSubUsers();
  }, [userId]);

  // Adiciona um novo sub-usuário à lista
  const handleAddSubUser = () => {
    if (newSubUser.trim() !== "") {
      const updatedSubUsers = [...subUsers, newSubUser.trim()];
      setSubUsers(updatedSubUsers);
      setNewSubUser("");
    }
  };

  // Remove um sub-usuário pelo índice
  const handleRemoveSubUser = (index) => {
    const updatedSubUsers = subUsers.filter((_, i) => i !== index);
    setSubUsers(updatedSubUsers);
  };

  // Salva a lista atualizada de sub-usuários no Firestore
  const handleSaveSubUsers = async () => {
    try {
      await updateDoc(doc(db, "users", userId), {
        subUsers: subUsers,
      });
      alert("Sub-usuários atualizados com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar sub-usuários:", error);
      alert("Erro ao salvar sub-usuários.");
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6">Gerenciar Sub-Usuários</Typography>
      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        <TextField
          label="Novo Sub-Usuário"
          value={newSubUser}
          onChange={(e) => setNewSubUser(e.target.value)}
          size="small"
        />
        <Button variant="contained" onClick={handleAddSubUser}>
          Adicionar
        </Button>
      </Box>
      <List>
        {subUsers.map((subUser, index) => (
          <ListItem
            key={index}
            secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveSubUser(index)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText primary={subUser} />
          </ListItem>
        ))}
      </List>
      <Button variant="contained" onClick={handleSaveSubUsers} sx={{ mt: 2 }}>
        Salvar Sub-Usuários
      </Button>
    </Box>
  );
};

export default SubUsersManager;
