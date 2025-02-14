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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
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
  const [periodicity, setPeriodicity] = useState("");
  const [owner, setOwner] = useState("global"); // Default "global"
  const [editId, setEditId] = useState(null);
  const [subUsers, setSubUsers] = useState([]);
  const auth = getAuth();

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

  // Função para buscar os sub-usuários do usuário atual
  const fetchSubUsers = async (uid) => {
    try {
      const userDoc = await getDocs(collection(firestore, "users"));
      // Aqui você pode filtrar pelo uid, se os sub-usuários estiverem armazenados no documento do usuário.
      // Neste exemplo, assumo que cada usuário tem seu próprio documento com o campo subUsers.
      const docRef = await getDocs(collection(firestore, "users"));
      // Para simplificar, usaremos o campo "subUsers" do documento do usuário atual.
      // Se estiver usando Firebase Auth, obtenha o uid do usuário.
      // Exemplo:
      const userDocSnap = await getDocs(collection(firestore, "users"));
      // Supondo que o documento do usuário atual contenha o campo "subUsers":
      // (Aqui vamos usar onAuthStateChanged para obter o uid e, em seguida, buscar o documento)
      // Para este exemplo, vamos assumir que subUsers já foi definido.
      // Você pode personalizar essa função conforme sua necessidade.
    } catch (error) {
      console.error("Erro ao buscar sub-usuários:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
    // Obter sub-usuários do documento do usuário atual
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDocs(collection(firestore, "users"));
          // Aqui você precisa obter o documento do usuário atual.
          // Suponha que o documento do usuário seja identificado pelo uid:
          const docSnap = await getDocs(collection(firestore, "users"));
          // Para simplificar, vamos buscar diretamente pelo uid:
          // (Ajuste conforme sua estrutura)
          // Exemplo:
          const userData = await getDocs(collection(firestore, "users"));
          // Neste exemplo, vamos assumir que a lista de subUsers é armazenada no documento do usuário atual.
          // Substitua pela lógica correta conforme sua estrutura.
          // Aqui, vamos simular:
          const subUsersList = ["global", "Perfil 1", "Perfil 2"]; // Exemplo fixo para testes
          setSubUsers(subUsersList);
        } catch (error) {
          console.error("Erro ao buscar sub-usuários:", error);
        }
      }
    });
    return unsubscribe;
  }, [auth]);

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
          periodicity: Number(periodicity),
          owner,
        });
        setEditId(null);
      } else {
        // Adiciona uma nova tarefa
        await addDoc(collection(firestore, "tasks"), {
          description,
          points: Number(points),
          periodicity: Number(periodicity),
          owner,
          createdAt: new Date(),
        });
      }
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

  // Função para iniciar a edição de uma tarefa
  const handleEdit = (task) => {
    setEditId(task.id);
    setDescription(task.description);
    setPoints(task.points);
    setPeriodicity(task.periodicity);
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
          label="Periodicidade (em dias)"
          variant="outlined"
          type="number"
          value={periodicity}
          onChange={(e) => setPeriodicity(e.target.value)}
          required
        />
        <FormControl fullWidth>
          <InputLabel id="owner-select-label">Owner</InputLabel>
          <Select
            labelId="owner-select-label"
            id="owner-select"
            value={owner}
            label="Owner"
            onChange={(e) => setOwner(e.target.value)}
          >
            {subUsers.map((userOption, index) => (
              <MenuItem key={index} value={userOption}>
                {userOption}
              </MenuItem>
            ))}
            <MenuItem value="global">global</MenuItem>
          </Select>
        </FormControl>
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
