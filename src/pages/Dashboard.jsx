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
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
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

  const effectiveOwner = activeSubUser?.name || "global";


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
        .filter((task) => task.userId === currentUser.uid)
        .sort((a, b) => a.description.localeCompare(b.description)); // Ordenação alfabética
  
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

  const pendingTasks = tasks.filter(
    (task) =>
      !task.completed && (!task.owner || task.owner === "" || task.owner === "global")
  );

  const concludedTasks = tasks.filter(
    (task) => task.completed && task.owner && task.owner !== "" && task.owner !== "global"
  );

  const tasksByOwner = concludedTasks.reduce((acc, task) => {
    const owner = task.owner;
    acc[owner] = (acc[owner] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(tasksByOwner).map((owner) => ({
    name: owner,
    value: tasksByOwner[owner],
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF"];

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

  const resetTask = async (taskId) => {
    try {
      const taskRef = doc(firestore, "tasks", taskId);
      await updateDoc(taskRef, { completed: false, owner: "" });
      fetchTasks();
    } catch (error) {
      console.error("Erro ao resetar tarefa:", error);
    }
  };

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
        Usuário ativo: {effectiveOwner}
      </Typography>
      <Button
        variant="outlined"
        onClick={() => navigate("/user-selection")}
        sx={{ mb: 2, display: "block", mx: "auto", fontSize: "0.9rem", padding: "6px 12px" }}
      >
        Trocar Perfil
      </Button>

      {/* Gráfico Donuts de tarefas concluidas */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <PieChart width={400} height={300}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60} // Adicionado para formato de donut
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </Box>


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

      




      {Object.keys(tasksByOwner).map((ownerName) => (
        <Box key={ownerName} sx={{ mt: 4 }}>
          <Typography variant="h6" align="center" sx={{ mb: 2 }}>
            Tarefas Concluídas por {ownerName}
          </Typography>
          <Grid container spacing={2}>
            {concludedTasks
              .filter((task) => task.owner === ownerName)
              .map((task) => (
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
