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
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase-config";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState("");
  const [periodicity, setPeriodicity] = useState("");
  // "owner" é usado para atribuir a tarefa
  const [owner, setOwner] = useState("global");
  const [editId, setEditId] = useState(null);
  // Lista de perfis para atribuição (não filtra as tarefas exibidas)
  const [subUsers, setSubUsers] = useState(["global"]);
  const auth = getAuth();

  // Função para buscar todas as tarefas
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

  // Função para buscar os perfis do usuário, incluindo o usuário principal
  const fetchSubUsers = async (uid) => {
    try {
      const userDocRef = doc(firestore, "users", uid);
      const userDocSnap = await getDoc(userDocRef);
      let finalList = [];
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        console.log("Dados do usuário:", userData);
        const userSubProfiles = Array.isArray(userData.subUsers) ? userData.subUsers : [];
        // Obtém o nome principal: displayName ou email (ou "Sem Nome" se estiver vazio)
        const mainUserName = auth.currentUser.displayName || auth.currentUser.email || "Sem Nome";
        // Constrói a lista final: "global", seguido do usuário principal, depois os demais sub‑usuários (evitando duplicatas)
        finalList = ["global"];
        if (mainUserName && !userSubProfiles.includes(mainUserName)) {
          finalList.push(mainUserName);
        } else if (mainUserName) {
          finalList.push(mainUserName);
        }
        finalList = [...finalList, ...userSubProfiles.filter(profile => profile && profile !== mainUserName)];
      } else {
        finalList = ["global"];
      }
      if (finalList.length === 0) {
        finalList = ["global"];
      }
      setSubUsers(finalList);
      if (!finalList.includes(owner)) {
        setOwner(finalList[0]);
      }
    } catch (error) {
      console.error("Erro ao buscar sub-usuários:", error);
      setSubUsers(["global"]);
    }
  };

  useEffect(() => {
    fetchTasks();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchSubUsers(user.uid);
        setOwner("global");
      } else {
        setSubUsers(["global"]);
        setOwner("global");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const taskRef = doc(firestore, "tasks", editId);
        await updateDoc(taskRef, {
          description,
          points: Number(points),
          periodicity: Number(periodicity),
          owner,
        });
        setEditId(null);
      } else {
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
                {userOption || "Sem Nome"}
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
          <ListItem key={task.id} sx={{ display: "flex", justifyContent: "space-between" }}>
            <ListItemText
              primary={task.description}
              secondary={`Pontos: ${task.points} - Periodicidade: ${task.periodicity} dia(s) - Owner: ${task.owner}`}
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
