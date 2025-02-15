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
  Box
} from "@mui/material";
import { collection, getDocs, updateDoc, doc, getDoc, increment } from "firebase/firestore";
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

  // effectiveOwner é o valor do contexto ou "global" se não definido
  const effectiveOwner = activeSubUser || "global";

  // Função para buscar os pontos do usuário para o perfil ativo
  const fetchUserPoints = useCallback(async () => {
    if (!currentUser) return;
    try {
      const userDocSnap = await getDoc(doc(firestore, "users", currentUser.uid));
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        // Suponha que os pontos estejam armazenados em um campo pointsByProfile (objeto)
        // Se não, use um campo simples, mas para diferenciar perfis, é melhor usar um objeto.
        const pointsByProfile = data.pointsByProfile || {};
        setUserPoints(pointsByProfile[effectiveOwner] || 0);
      }
    } catch (error) {
      console.error("Erro ao buscar pontos do usuário:", error);
    }
  }, [currentUser, effectiveOwner]);

  // Função para buscar tarefas e transformar tarefas globais
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
      console.log("Perfil ativo:", effectiveOwner);
      console.log("Todas as tarefas:", tasksData);

      // Transforme tarefas globais: se task.owner é "global" e effectiveOwner não é "global", atribua effectiveOwner
      const transformedTasks = tasksData.map((task) => {
        if (task.owner === "global" && effectiveOwner !== "global") {
          return { ...task, owner: effectiveOwner };
        }
        return task;
      });

      // Filtra tarefas: exibe tarefas cujo owner seja igual ao UID ou igual ao perfil ativo
      const filteredTasks = transformedTasks.filter(
        (task) =>
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
      fetchUserPoints();
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [currentUser, effectiveOwner, fetchTasks, fetchUserPoints]);

  const markTaskAsCompleted = async (taskId, taskPoints) => {
    try {
      const taskRef = doc(firestore, "tasks", taskId);
      await updateDoc(taskRef, { completed: true });
      // Atualiza os pontos do usuário para o perfil ativo
      const userRef = doc(firestore, "users", currentUser.uid);
      // Aqui, assumindo que você tem um campo "pointsByProfile" no documento do usuário
      await updateDoc(userRef, {
        [`pointsByProfile.${effectiveOwner}`]: increment(taskPoints)
      });
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, completed: true } : task
        )
      );
      setUserPoints((prev) => prev + taskPoints);
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
                        onClick={() => markTaskAsCompleted(task.id, task.points)}
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
