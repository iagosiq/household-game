import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Checkbox,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { firestore } from "../firebase/firebase-config";
import { useAuth } from "../context/AuthContext";

export default function ListaDeCompras() {
  const { currentUser } = useAuth();
  const [item, setItem] = useState("");
  const [items, setItems] = useState([]);

  // Função para buscar os itens do usuário na coleção "shoppingItems"
  const fetchItems = async () => {
    if (!currentUser) return;
    try {
      const q = query(
        collection(firestore, "shoppingItems"),
        where("userId", "==", currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const itemsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(itemsData);
    } catch (error) {
      console.error("Erro ao buscar itens:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [currentUser]);

  // Adiciona um novo item à coleção "shoppingItems"
  const handleAddItem = async () => {
    if (item.trim() === "" || !currentUser) return;
    try {
      const newItem = {
        userId: currentUser.uid,
        name: item.trim(),
        completed: false,
      };
      await addDoc(collection(firestore, "shoppingItems"), newItem);
      setItem("");
      fetchItems();
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
    }
  };

  // Alterna o status de conclusão de um item
  const toggleItemCompletion = async (id, currentCompleted) => {
    try {
      const itemRef = doc(firestore, "shoppingItems", id);
      await updateDoc(itemRef, { completed: !currentCompleted });
      fetchItems();
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
    }
  };

  // Exclui um item
  const handleDeleteItem = async (id) => {
    try {
      await deleteDoc(doc(firestore, "shoppingItems", id));
      fetchItems();
    } catch (error) {
      console.error("Erro ao deletar item:", error);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Lista de Compras
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          label="Adicionar item"
          variant="outlined"
          value={item}
          onChange={(e) => setItem(e.target.value)}
        />
        <Button variant="contained" onClick={handleAddItem}>
          Adicionar
        </Button>
      </Box>
      <List>
        {items.map((it) => (
          <ListItem
            key={it.id}
            secondaryAction={
              <IconButton
                edge="end"
                onClick={() => handleDeleteItem(it.id)}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={it.completed}
                onChange={() => toggleItemCompletion(it.id, it.completed)}
              />
            </ListItemIcon>
            <ListItemText
              primary={it.name}
              sx={{ textDecoration: it.completed ? "line-through" : "none" }}
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
