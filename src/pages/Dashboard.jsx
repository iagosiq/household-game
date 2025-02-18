// src/pages/Dashboard.jsx
import React, { useEffect, useState, useCallback, useContext } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button,
  Box,
} from "@mui/material";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  writeBatch,
} from "firebase/firestore";
import { firestore } from "../firebase/firebase-config";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ActiveSubUserContext } from "../context/ActiveSubUserContext";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { activeSubUser } = useContext(ActiveSubUserContext);
  const navigate = useNavigate();

  // Se activeSubUser for definido, use seu "name", caso contrário use "global"
  const effectiveOwner = activeSubUser && activeSubUser.name ? activeSubUser.name : "global";
  console.log("Subusuário ativo no Dashboard:", activeSubUser);

  // Função para buscar as tarefas do usuário atual (filtrando pelo campo userId)
  const fetchTasks = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(firestore, "tasks"));
      const tasksData = querySnapshot.docs
        .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
        .filter((task) => task.userId === currentUser.uid);
      setTasks(tasksData);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchTasks();
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [currentUser, fetchTasks]);

  // Tarefas Pendentes: tarefas não concluídas e com owner vazio ou "global"
  const pendingTasks = tasks.filter(
    (task) => !task.completed && (!task.owner || task.owner === "" || task.owner === "global")
  );
  // Tarefas Concluídas: tarefas concluídas e cujo owner é diferente de vazio e "global"
  const concludedTasks = tasks.filter(
    (task) => task.completed && task.owner && task.owner !== "" && task.owner !== "global"
  );

  // Agrupa as tarefas concluídas por subusuário (owner)
  const tasksByOwner = concludedTasks.reduce((acc, task) => {
    const owner = task.owner;
    if (!acc[owner]) {
      acc[owner] = [];
    }
    acc[owner].push(task);
    return acc;
  }, {});

  // Função para concluir uma tarefa pendente usando o subusuário ativo
  const completeTask = async (taskId) => {
    if (effectiveOwner === "global") {
      alert("Selecione um subusuário antes de concluir a tarefa.");
      return;
    }
    try {
      const taskRef = doc(firestore, "tasks", taskId);
      await updateDoc(taskRef, { completed: true, owner: effectiveOwner });
      fetchTasks();
    } catch (error) {
      console.error("Erro ao concluir tarefa:", error);
    }
  };

  // Função para resetar uma tarefa individual: volta para pendente (owner = "" e completed = false)
  const resetTask = async (taskId) => {
    try {
      const taskRef = doc(firestore, "tasks", taskId);
      await updateDoc(taskRef, { completed: false, owner: "" });
      fetchTasks();
    } catch (error) {
      console.error("Erro ao resetar tarefa:", error);
    }
  };

  // Função global para resetar todas as tarefas do usuário atual
  const resetAllTasks = async () => {
    if (!currentUser) return;
    try {
      const batch = writeBatch(firestore);
      const querySnapshot = await getDocs(collection(firestore, "tasks"));
      querySnapshot.docs.forEach((docSnap) => {
        const task = docSnap.data();
        if (task.userId === currentUser.uid) {
          batch.update(docSnap.ref, { completed: false, owner: "" });
        }
      });
      await batch.commit();
      fetchTasks();
    } catch (error) {
      console.error("Erro ao resetar todas as tarefas:", error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Dashboard
      </Typography>
      <Typography variant="h6" align="center" sx={{ mb: 2 }}>
        Subusuário ativo: {effectiveOwner}
      </Typography>
      <Button
        variant="outlined"
        onClick={() => navigate("/user-selection")}
        sx={{
          mb: 2,
          display: "block",
          mx: "auto",
          fontSize: "0.9rem",
          padding: "6px 12px",
        }}
      >
        Trocar Perfil
      </Button>

      {/* Seção de Tarefas Pendentes */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" align="center" sx={{ mb: 2 }}>
          Tarefas Pendentes
        </Typography>
        {loading ? (
          <Grid container justifyContent="center">
            <CircularProgress />
          </Grid>
        ) : pendingTasks.length ? (
          <Grid container spacing={2}>
            {pendingTasks.map((task) => (
              <Grid item xs={12} sm={6} md={4} key={task.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{task.description}</Typography>
                    <Typography variant="body2" color="red">
                      Pendente
                    </Typography>
                    <Box mt={1}>
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ fontSize: "0.8rem", padding: "4px 8px" }}
                        onClick={() => completeTask(task.id)}
                      >
                        Concluir
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography align="center">Nenhuma tarefa pendente encontrada.</Typography>
        )}
      </Box>

      {/* Seção de Tarefas Concluídas agrupadas por subusuário */}
      {Object.keys(tasksByOwner).length > 0 &&
        Object.keys(tasksByOwner).map((ownerName) => (
          <Box key={ownerName} sx={{ mt: 4 }}>
            <Typography variant="h6" align="center" sx={{ mb: 2 }}>
              Tarefas Concluídas por {ownerName}
            </Typography>
            <Grid container spacing={2}>
              {tasksByOwner[ownerName].map((task) => (
                <Grid item xs={12} sm={6} md={4} key={task.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{task.description}</Typography>
                      <Typography variant="body2" color="green">
                        Concluída
                      </Typography>
                      <Box mt={1}>
                        <Button
                          variant="outlined"
                          color="secondary"
                          sx={{ fontSize: "0.8rem", padding: "4px 8px" }}
                          onClick={() => resetTask(task.id)}
                        >
                          Resetar
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}

      {/* Botão global para resetar todas as tarefas */}
      <Box display="flex" justifyContent="center" gap={2} sx={{ mt: 4 }}>
        <Button
          variant="contained"
          color="warning"
          sx={{ fontSize: "0.9rem", padding: "6px 12px" }}
          onClick={resetAllTasks}
        >
          Resetar Todas as Tarefas
        </Button>
      </Box>
    </Container>
  );
}
