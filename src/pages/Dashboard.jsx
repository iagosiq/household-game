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
  TextField,
} from "@mui/material";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  writeBatch,
  query,
  where,
} from "firebase/firestore";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { firestore } from "../firebase/firebase-config";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ActiveSubUserContext } from "../context/ActiveSubUserContext";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { currentUser } = useAuth();
  const { activeSubUser } = useContext(ActiveSubUserContext);
  const navigate = useNavigate();

  // Se activeSubUser existir e tiver propriedade name, usamos; caso contrário, "global"
  const effectiveOwner = activeSubUser?.name || "global";
  console.log("Subusuário ativo no Dashboard:", effectiveOwner);

  // Função para buscar tarefas do Firestore filtradas pelo userId e ordenadas alfabeticamente
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
        .sort((a, b) => a.description.localeCompare(b.description));
      setTasks(tasksData);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Função para buscar a lista de compras apenas para o usuário atual
  const fetchShoppingList = useCallback(async () => {
    if (!currentUser) return;
    try {
      const shoppingQuery = query(
        collection(firestore, "shoppingItems"),
        where("userId", "==", currentUser.uid)
      );
      const querySnapshot = await getDocs(shoppingQuery);
      const items = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setShoppingList(items);
    } catch (error) {
      console.error("Erro ao buscar lista de compras:", error);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchTasks();
      fetchShoppingList();
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [currentUser, fetchTasks, fetchShoppingList]);

  // Filtra as tarefas com base no termo de busca
  const filteredTasks = tasks.filter((task) =>
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Tarefas pendentes: não concluídas e cujo owner esteja vazio ou "global"
  const pendingTasks = filteredTasks.filter(
    (task) =>
      !task.completed &&
      (!task.owner || task.owner === "" || task.owner === "global")
  );

  // Tarefas concluídas: concluídas com owner definido (exceto "global")
  const concludedTasks = filteredTasks.filter(
    (task) =>
      task.completed &&
      task.owner &&
      task.owner !== "" &&
      task.owner !== "global"
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

  // Dados para o gráfico de donut: cada objeto possui o nome do subusuário e a quantidade de tarefas concluídas
  const chartData = Object.keys(tasksByOwner).map((owner) => ({
    name: owner,
    value: tasksByOwner[owner].length,
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF"];

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

  // Função para resetar uma tarefa individual (volta para pendente)
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
      <Typography variant="h4" align="center" sx={{ mb: 2 }}>
        Bem-vindo(a) {effectiveOwner}
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

      {/* Área de Gráfico e Pré-visualização da Lista de Compras */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "center",
          alignItems: "center",
          gap: 4,
          mt: 4,
        }}
      >
        {/* Gráfico de Donut */}
        <Box>
          <PieChart width={400} height={300}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
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
        {/* Pré-visualização da Lista de Compras */}
        <Box
          sx={{
            p: 2,
            border: "1px solid #ccc",
            borderRadius: "8px",
            cursor: "pointer",
            width: { xs: "100%", sm: "300px" },
            textAlign: "center",
          }}
          onClick={() => navigate("/lista-de-compras")}
        >
          <Typography variant="subtitle1" sx={{ mb: 1 }} fontWeight={600}>
            Lista de Compras
          </Typography>
          {shoppingList.length > 0 ? (
            shoppingList.slice(0, 3).map((item) => (
              <Typography key={item.id} variant="body2">
                {item.name}
              </Typography>
            ))
          ) : (
            <Typography variant="body2">Nenhum item na lista</Typography>
          )}
        </Box>
      </Box>

      {/* Barra de Busca */}
      <Box sx={{ mt: 4, mb: 2 }}>
        <TextField
          label="Buscar Tarefas"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>

      {/* Seção de Tarefas Pendentes */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" align="center" sx={{ mb: 2, color: "red" }}>
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
          <Typography align="center">
            Nenhuma tarefa pendente encontrada.
          </Typography>
        )}
      </Box>

      {/* Seção de Tarefas Concluídas por Subusuário */}
      {Object.keys(tasksByOwner).map((ownerName) => (
        <Box key={ownerName} sx={{ mt: 4 }}>
          <Typography
            variant="h6"
            align="center"
            sx={{ mb: 2, color: "green" }}
          >
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

      {/* Botão global para resetar todas as tarefas */}
      <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
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
