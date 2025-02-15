import React, { useEffect, useState, useCallback, useContext } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button
} from "@mui/material";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
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

  // Se activeSubUser estiver definido, usamos seu valor; caso contrário, fallback para "global"
  const effectiveOwner = activeSubUser || "global";

  const fetchTasks = useCallback(async () => {
    if (!currentUser) {
      console.warn("Usuário não definido, não buscando tarefas.");
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
      console.log("Owner efetivo:", effectiveOwner);
      console.log("Todas as tarefas:", tasksData);

      // Filtra tarefas: owner igual ao UID ou igual ao nome do subusuário selecionado
      const filteredTasks = tasksData.filter((task) =>
        task.owner === currentUser.uid || task.owner === effectiveOwner
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
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [currentUser, effectiveOwner, fetchTasks]);

  const markTaskAsCompleted = async (taskId) => {
    try {
      const taskRef = doc(firestore, "tasks", taskId);
      await updateDoc(taskRef, { completed: true });
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, completed: true } : task
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
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
      <Button
        variant="outlined"
        onClick={() => navigate("/user-selection")}
        sx={{ mb: 2, display: "block", mx: "auto" }}
      >
        Trocar Subusuário
      </Button>
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
                    {!task.completed && (
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={() => markTaskAsCompleted(task.id)}
                      >
                        Concluir Tarefa
                      </Button>
                    )}
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
