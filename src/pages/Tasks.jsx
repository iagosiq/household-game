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
  IconButton 
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase-config";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState("");
  const [periodicity, setPeriodicity] = useState(""); // Será convertido para número
  const [owner, setOwner] = useState("global");
  const [editId, setEditId] = useState(null);

  // Função para buscar as tarefas da coleção "tasks"
  const fetchTasks = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, "tasks"));
      const tasksData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(tasksData);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Função para adicionar ou atualizar uma tarefa
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        // Atualiza a tarefa existente
        const taskRef = doc(firestore, "tasks", editId);
        await updateDoc(taskRef, {
          description,
          points: Number(points),
          periodicity: Number(periodicity), // Converte para número
          owner,
        });
        setEditId(null);
      } else {
        // Adiciona uma nova tarefa
        await addDoc(collection(firestore, "tasks"), {
          description,
          points: Number(points),
          periodicity: Number(periodicity), // Converte para número
          owner,
          createdAt: new Date(),
        });
      }
      // Limpa os campos após a submissão
      setDescription("");
      setPoints("");
      setPeriodicity("");
      setOwner("global");
      fetchTasks();
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
    }
  };

  // Função para excluir uma tarefa
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(firestore, "tasks", id));
      fetchTasks();
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
    }
  };

  // Função para editar uma tarefa
  const handleEdit = (task) => {
    setEditId(task.id);
    setDescription(task.description);
    setPoints(task.points);
    setPeriodicity(task.periodicity); // Se o valor salvo for numérico, ele será convertido para string no input
    setOwner(task.owner);
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
        <TextField
          label="Pontos"
          variant="outlined"
          type="number"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          required
        />
        <TextField
          label="Periodicidade (em dias, ex.: 1 para diário, 2 para a cada 2 dias)"
          variant="outlined"
          type="number"  // Define para aceitar somente números
          value={periodicity}
          onChange={(e) => setPeriodicity(e.target.value)}
          required
        />
        <TextField
          label="Owner (UID ou 'global')"
          variant="outlined"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
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
          <ListItem
            key={task.id}
            secondaryAction={
              <Box>
                <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(task)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(task.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemText
              primary={task.description}
              secondary={`Pontos: ${task.points} - Periodicidade: ${task.periodicity} dia(s) - Owner: ${task.owner}`}
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}

