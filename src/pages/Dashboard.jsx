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

  // Se o perfil ativo estiver definido, usamos-o; caso contrário, usamos "global".
  const effectiveOwner = activeSubUser || "global";

  // Função para buscar todas as tarefas do Firestore
  const fetchTasks = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(firestore, "tasks"));
      const tasksData = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      // Filtra as tarefas: mostra tarefas do usuário principal, do perfil ativo ou globais
      const filteredTasks = tasksData.filter(
        (task) =>
          task.owner === currentUser.uid ||
          task.owner === effectiveOwner ||
          task.owner === "global"
      );
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
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [currentUser, effectiveOwner, fetchTasks]);

  // Separa as tarefas pendentes e concluídas
  const pendingTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  // Função para concluir uma tarefa (marca como concluída)
  const completeTask = async (taskId) => {
    try {
      const taskRef = doc(firestore, "tasks", taskId);
      await updateDoc(taskRef, { completed: true });
      fetchTasks();
    } catch (error) {
      console.error("Erro ao concluir tarefa:", error);
    }
  };

  // Função para resetar uma tarefa individual (marca como não concluída)
  const resetTask = async (taskId) => {
    try {
      const taskRef = doc(firestore, "tasks", taskId);
      await updateDoc(taskRef, { completed: false });
      fetchTasks();
    } catch (error) {
      console.error("Erro ao resetar tarefa:", error);
    }
  };

  // Botão para resetar todas as tarefas (global)
  const resetAllTasks = async () => {
    if (!currentUser) return;
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

  // Botão para encerrar a campanha: zera todas as tarefas (para os perfis relevantes)
  // e registra um histórico (por simplicidade, apenas registra para o perfil ativo).
  const endCampaign = async () => {
    if (!currentUser) return;
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
      // Aqui você pode registrar no histórico. Por simplicidade, vamos registrar num documento único.
      const historyRef = doc(collection(firestore, "history"));
      await setDoc(historyRef, {
        userId: currentUser.uid,
        profile: effectiveOwner,
        timestamp: new Date().toISOString(),
        tasksCompleted: completedTasks.map((task) => ({
          id: task.id,
          description: task.description,
          points: task.points,
        })),
      });
      // Zera os pontos do perfil ativo se aplicável – aqui, como estamos ignorando os pontos, omitimos essa parte.
      await batch.commit();
      fetchTasks();
    } catch (error) {
      console.error("Erro ao encerrar campanha:", error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Dashboard
      </Typography>
      <Button
        variant="outlined"
        onClick={() => navigate("/user-selection")}
        sx={{ mb: 2, display: "block", mx: "auto", fontSize: "0.7rem", padding: "6px 12px" }}
      >
        Trocar Perfil
      </Button>
      <Typography variant="h7" align="center" sx={{ mb: 2 }}>
        Exibindo tarefas para: {effectiveOwner}
      </Typography>

      {/* Seção de tarefas pendentes */}
      <Typography variant="h6" align="center" sx={{ mt: 2, mb: 1 }}>
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
              <Card
                sx={{
                  backgroundColor: task.owner === "global" ? "#F5F4F2" : "inherit",
                }}
              >
                <CardContent>
                  <Typography variant="h6">{task.description}</Typography>
                  <Typography variant="body2">Owner: {task.owner}</Typography>
                  <Typography variant="body2" color="red">
                    Pendente
                  </Typography>
                  <Box mt={1} display="flex" gap={1}>
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

      {/* Seção de tarefas concluídas */}
      <Typography variant="h6" align="center" sx={{ mt: 4, mb: 1 }}>
        Tarefas Concluídas
      </Typography>
      {loading ? (
        <Grid container justifyContent="center">
          <CircularProgress />
        </Grid>
      ) : completedTasks.length ? (
        <Grid container spacing={2}>
          {completedTasks.map((task) => (
            <Grid item xs={12} sm={6} md={4} key={task.id}>
              <Card
                sx={{
                  backgroundColor: task.owner === "global" ? "#e3f2fd" : "inherit",
                }}
              >
                <CardContent>
                  <Typography variant="h6">{task.description}</Typography>
                  <Typography variant="body2">Owner: {task.owner}</Typography>
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
      ) : (
        <Typography align="center">Nenhuma tarefa concluída encontrada.</Typography>
      )}

      {/* Botões globais para reset */}
      <Box display="flex" justifyContent="center" gap={2} sx={{ mt: 4 }}>
        <Button
          variant="contained"
          color="warning"
          sx={{ fontSize: "0.8rem", padding: "6px 12px" }}
          onClick={resetAllTasks}
        >
          Resetar Todas as Tarefas
        </Button>
      </Box>

      <Grid container justifyContent="center" sx={{ mt: 4 }}>
        <Button
          variant="contained"
          onClick={() => navigate("/tasks")}
          sx={{ fontSize: "0.7rem", padding: "6px 12px" }}
        >
          Gerenciar Tarefas
        </Button>
      </Grid>
    </Container>
  );
}
