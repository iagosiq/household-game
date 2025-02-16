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
  getDoc,
  increment,
  setDoc,
} from "firebase/firestore";
import { firestore } from "../firebase/firebase-config";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ActiveSubUserContext } from "../context/ActiveSubUserContext";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);
  const { currentUser } = useAuth();
  const { activeSubUser } = useContext(ActiveSubUserContext);
  const navigate = useNavigate();

  // Definimos effectiveOwner como o valor do subusuário ativo ou, se não definido, "global"
  const effectiveOwner = activeSubUser || "global";

  // Busca os pontos do usuário para o perfil ativo
  const fetchUserPoints = useCallback(async () => {
    if (!currentUser) return;
    try {
      const userRef = doc(firestore, "users", currentUser.uid);
      const userDocSnap = await getDoc(userRef);
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        const pointsByProfile = data.pointsByProfile || {};
        setUserPoints(pointsByProfile[effectiveOwner] || 0);
      }
    } catch (error) {
      console.error("Erro ao buscar pontos do usuário:", error);
    }
  }, [currentUser, effectiveOwner]);

  // Busca todas as tarefas e filtra para exibir as tarefas relevantes:
  // aquelas cujo owner é o UID do usuário, o perfil ativo ou "global".
  const fetchTasks = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(firestore, "tasks"));
      const tasksData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Usuário autenticado:", currentUser.uid);
      console.log("Perfil ativo:", effectiveOwner);
      console.log("Todas as tarefas:", tasksData);
      // Filtra tarefas: mostramos todas as tarefas que são do usuário, do perfil ativo ou globais
      const filteredTasks = tasksData.filter(
        (task) =>
          task.owner === currentUser.uid ||
          task.owner === effectiveOwner ||
          task.owner === "global"
      );
      console.log("Tarefas filtradas:", filteredTasks);
      setTasks(filteredTasks);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, effectiveOwner]);

  useEffect(() => {
    if (currentUser) {
      fetchTasks();
      fetchUserPoints();
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [currentUser, effectiveOwner, fetchTasks, fetchUserPoints]);

  // Marca uma tarefa como concluída e incrementa os pontos no documento do usuário
  const markTaskAsCompleted = async (taskId, taskPoints) => {
    try {
      const taskRef = doc(firestore, "tasks", taskId);
      await updateDoc(taskRef, { completed: true });
      const userRef = doc(firestore, "users", currentUser.uid);
      await updateDoc(userRef, {
        [`pointsByProfile.${effectiveOwner}`]: increment(taskPoints),
      });
      fetchTasks();
      fetchUserPoints();
    } catch (error) {
      console.error("Erro ao concluir tarefa:", error);
    }
  };

  // Reseta uma tarefa individual (marca como não concluída)
  const resetTask = async (taskId) => {
    try {
      const taskRef = doc(firestore, "tasks", taskId);
      await updateDoc(taskRef, { completed: false });
      fetchTasks();
    } catch (error) {
      console.error("Erro ao resetar tarefa:", error);
    }
  };

  // Reseta todas as tarefas para não concluídas (para o usuário atual, perfil ativo ou globais)
  const resetAllTasks = async () => {
    try {
      const batch = writeBatch(firestore);
      const querySnapshot = await getDocs(collection(firestore, "tasks"));
      querySnapshot.docs.forEach((docSnap) => {
        const task = docSnap.data();
        if (
          task.owner === currentUser.uid ||
          task.owner === effectiveOwner ||
          task.owner === "global"
        ) {
          batch.update(docSnap.ref, { completed: false });
        }
      });
      await batch.commit();
      fetchTasks();
    } catch (error) {
      console.error("Erro ao resetar todas as tarefas:", error);
    }
  };

  // Encerra a campanha:
  // - Reseta todas as tarefas
  // - Zera os pontos do perfil ativo no documento do usuário
  // - Armazena um registro no histórico com os pontos atuais (como ranking)
  const endCampaign = async () => {
    try {
      const batch = writeBatch(firestore);
      // Reseta todas as tarefas
      const tasksSnapshot = await getDocs(collection(firestore, "tasks"));
      tasksSnapshot.docs.forEach((docSnap) => {
        const task = docSnap.data();
        if (
          task.owner === currentUser.uid ||
          task.owner === effectiveOwner ||
          task.owner === "global"
        ) {
          batch.update(docSnap.ref, { completed: false });
        }
      });
      // Zera os pontos do perfil ativo
      const userRef = doc(firestore, "users", currentUser.uid);
      batch.update(userRef, { [`pointsByProfile.${effectiveOwner}`]: 0 });
      await batch.commit();

      // Armazena o ranking na coleção "history"
      // Usaremos o timestamp atual como ID do documento de histórico
      const historyRef = doc(collection(firestore, "history"));
      await setDoc(historyRef, {
        userId: currentUser.uid,
        profile: effectiveOwner,
        points: userPoints,
        timestamp: new Date().toISOString(),
      });
      fetchTasks();
      fetchUserPoints();
    } catch (error) {
      console.error("Erro ao encerrar campanha:", error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Dashboard
      </Typography>
      <Typography variant="h6" align="center" sx={{ mb: 2 }}>
        Exibindo tarefas para: {effectiveOwner}
      </Typography>
      <Typography variant="h6" align="center" sx={{ mb: 2 }}>
        Pontos acumulados: {userPoints}
      </Typography>
      <Button
        variant="outlined"
        onClick={() => navigate("/user-selection")}
        sx={{ mb: 2, display: "block", mx: "auto" }}
      >
        Trocar Perfil
      </Button>
      
      {/* Botões de Reset */}
      <Box display="flex" justifyContent="center" gap={2} mb={2}>
        <Button variant="contained" color="warning" onClick={resetAllTasks}>
          Resetar Todas as Tarefas
        </Button>
        <Button variant="contained" color="error" onClick={endCampaign}>
          Encerrar Campanha
        </Button>
      </Box>

      {loading ? (
        <Grid container justifyContent="center">
          <CircularProgress />
        </Grid>
      ) : (
        <Grid container spacing={2}>
          {tasks.length ? (
            tasks.map((task) => (
              <Grid item xs={12} sm={6} md={4} key={task.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{task.description}</Typography>
                    <Typography color="text.secondary">
                      Pontos: {task.points} - Periodicidade: {task.periodicity} dia(s)
                    </Typography>
                    <Typography variant="body2">Owner: {task.owner}</Typography>
                    <Typography variant="body2" color={task.completed ? "green" : "red"}>
                      {task.completed ? "Concluída" : "Pendente"}
                    </Typography>
                    <Box mt={2} display="flex" gap={1}>
                      {!task.completed && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => markTaskAsCompleted(task.id, task.points)}
                        >
                          Concluir
                        </Button>
                      )}
                      {task.completed && (
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => resetTask(task.id)}
                        >
                          Resetar
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography align="center">Nenhuma tarefa encontrada.</Typography>
            </Grid>
          )}
        </Grid>
      )}

      <Grid container justifyContent="center" sx={{ mt: 4 }}>
        <Button variant="contained" onClick={() => navigate("/tasks")}>
          Gerenciar Tarefas
        </Button>
      </Grid>
    </Container>
  );
}
