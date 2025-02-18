// src/pages/Tasks.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase-config";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState("");
  const [editId, setEditId] = useState(null);
  const auth = getAuth();

  const fetchTasks = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, "tasks"));
      const tasksData = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((task) => task.userId === auth.currentUser.uid);
      setTasks(tasksData);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      fetchTasks();
    });
    return () => unsubscribe();
  }, [auth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const taskRef = doc(firestore, "tasks", editId);
        await updateDoc(taskRef, {
          description,
        });
        setEditId(null);
      } else {
        await addDoc(collection(firestore, "tasks"), {
          userId: auth.currentUser.uid,
          description,
          owner: "",
          completed: false,
          createdAt: new Date(),
        });
      }
      setDescription("");
      fetchTasks();
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(firestore, "tasks", id));
      fetchTasks();
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
    }
  };

  const handleEdit = (task) => {
    setEditId(task.id);
    setDescription(task.description);
    setPoints(task.points);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gerenciar Tarefas
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4 }}>
        <TextField
          label="Descrição"
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        
        <Button variant="contained" type="submit">
          {editId ? "Atualizar Tarefa" : "Adicionar Tarefa"}
        </Button>
      </Box>
      <Typography variant="h5" gutterBottom>
        Lista de Tarefas
      </Typography>
      <List>
        {tasks.map((task) => (
          <ListItem key={task.id} sx={{ display: "flex", justifyContent: "space-between" }}>
            <ListItemText
              primary={task.description}
            />
            <Box>
              <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(task)}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(task.id)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
