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
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where, getDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase-config";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState("");
  const [periodicity, setPeriodicity] = useState("");
  const [owner, setOwner] = useState("global"); // Padrão "global"
  const [editId, setEditId] = useState(null);
  const [subUsers, setSubUsers] = useState(["global"]);
  const auth = getAuth();

  // Função para buscar as tarefas no Firestore
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

  // Função para buscar os sub-perfis do usuário logado
  const fetchSubUsers = async (uid) => {
    try {
      const userDocRef = doc(firestore, "users", uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        console.log("Dados do usuário:", userData); // Debug

        // Verifica se subUsers existe e é um array, senão usa array vazio
        const userSubProfiles = Array.isArray(userData.subUsers) ? userData.subUsers : [];

        // Atualiza o estado com os sub-perfis + global
        setSubUsers(["global", ...userSubProfiles]);
      } else {
        console.warn("Usuário não encontrado no Firestore.");
      }
    } catch (error) {
      console.error("Erro ao buscar sub-usuários:", error);
    }
  };

  // useEffect para carregar tarefas e sub-perfis ao montar o componente
  useEffect(() => {
    fetchTasks();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        fetchSubUsers(user.uid);
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
            button // 🔹 Corrigido o erro do button aqui, antes estava `button={true}`
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

