// src/pages/Dashboard.jsx
import React, { useEffect, useState, useCallback, useContext, useRef } from "react";
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
  addDoc,
} from "firebase/firestore";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { firestore } from "../firebase/firebase-config";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ActiveSubUserContext } from "../context/ActiveSubUserContext";
import TaskIcon from "@mui/icons-material/Assignment";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  // Estado para controlar a visibilidade do dropdown de tarefas pendentes
  const [pendingOpen, setPendingOpen] = useState(false);
  const { currentUser } = useAuth();
  const { activeSubUser } = useContext(ActiveSubUserContext);
  const navigate = useNavigate();
  // Ref para o dropdown de tarefas pendentes
  const pendingDropdownRef = useRef(null);

  // Define effectiveOwner: se houver subusuário, usa seu nome; caso contrário, "global"
  const effectiveOwner = activeSubUser?.name || "global";
  console.log("Subusuário ativo no Dashboard:", effectiveOwner);

  // Função para buscar as tarefas do usuário (ordenadas alfabeticamente)
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

  // Função para buscar a lista de compras do usuário
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

  // Fecha o dropdown de tarefas pendentes ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        pendingDropdownRef.current &&
        !pendingDropdownRef.current.contains(event.target)
      ) {
        setPendingOpen(false);
      }
    };
    if (pendingOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pendingOpen]);

  // Filtra as tarefas de acordo com o termo de busca
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

  // Agrupa as tarefas concluídas por subusuário
  const tasksByOwner = concludedTasks.reduce((acc, task) => {
    const owner = task.owner;
    if (!acc[owner]) {
      acc[owner] = [];
    }
    acc[owner].push(task);
    return acc;
  }, {});

  // Dados para o gráfico de donut
  const chartData = Object.keys(tasksByOwner).map((owner) => ({
    name: owner,
    value: tasksByOwner[owner].length,
  }));

  const COLORS = ["primary", "#5B5B5B", "##636363", "#FF8042", "#A28DFF"];

  // Função para concluir uma tarefa pendente (usa o subusuário ativo)
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

  // Função para iniciar um novo dia: salva histórico e reseta tarefas concluídas
  const handleStartNewDay = async () => {
    if (!currentUser) return;
    try {
      const tasksQuerySnapshot = await getDocs(collection(firestore, "tasks"));
      const tasksData = tasksQuerySnapshot.docs
        .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
        .filter(
          (task) =>
            task.userId === currentUser.uid &&
            task.completed &&
            task.owner &&
            task.owner !== "" &&
            task.owner !== "global"
        );
      const tasksByOwner = tasksData.reduce((acc, task) => {
        const owner = task.owner;
        if (!acc[owner]) acc[owner] = [];
        acc[owner].push(task.description);
        return acc;
      }, {});
      await addDoc(collection(firestore, "history"), {
        userId: currentUser.uid,
        date: new Date(),
        tasksByOwner: tasksByOwner,
        note: "",
      });
      const batch = writeBatch(firestore);
      tasksData.forEach((task) => {
        const taskRef = doc(firestore, "tasks", task.id);
        batch.update(taskRef, { completed: false, owner: "" });
      });
      await batch.commit();
      fetchTasks();
      alert("Novo dia iniciado. Histórico atualizado e tarefas resetadas.");
    } catch (error) {
      console.error("Erro ao iniciar novo dia:", error);
      alert("Erro ao iniciar novo dia.");
    }
  };

  // Toggle para o dropdown de tarefas pendentes
  const togglePendingDropdown = () => {
    setPendingOpen((prev) => !prev);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Cabeçalho (exibido apenas em desktop) */}
      <Typography
        variant="h4"
        align="center"
        sx={{ mb: 2, display: { xs: "none", sm: "block" } }}
      >
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
      {/* Botão para Iniciar Novo Dia */}
      <Box display="flex" justifyContent="center" sx={{ mb: 4 }}>
        <Button variant="contained" color="primary" onClick={handleStartNewDay}>
          Iniciar Novo Dia
        </Button>
      </Box>

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
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
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

      {/* Conteúdo principal: Tarefas Pendentes (não exibidas inicialmente) */}

      {/* Botão fixo para abrir o dropdown de tarefas pendentes */}
      <Button
        variant="contained"
        color="primary"
        onClick={togglePendingDropdown}
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          borderRadius: "50%",
          width: 56,
          height: 56,
          minWidth: 0,
          zIndex: 1300,
        }}
      >
        <TaskIcon sx={{ fontSize: 28 }} />
      </Button>

      {/* Dropdown de tarefas pendentes */}
      {pendingOpen && (
        <Box
          ref={pendingDropdownRef}
          sx={{
            position: "fixed",
            bottom: 80,
            right: 16,
            width: { xs: "90%", sm: "300px" },
            maxHeight: "50vh",
            bgcolor: "background.paper",
            boxShadow: 3,
            borderRadius: 2,
            p: 2,
            overflowY: "auto",
            zIndex: 1300,
          }}
        >
          <TextField
            label="Buscar Tarefas"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
          />
          {loading ? (
            <CircularProgress />
          ) : pendingTasks.length > 0 ? (
            pendingTasks.map((task) => (
              <Box
                key={task.id}
                sx={{ mb: 1, display: "flex", justifyContent: "space-between" }}
              >
                <Typography variant="body1">{task.description}</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => completeTask(task.id)}
                >
                  Concluir
                </Button>
              </Box>
            ))
          ) : (
            <Typography variant="body2">
              Nenhuma tarefa pendente encontrada.
            </Typography>
          )}
        </Box>
      )}

      {/* Seção de Tarefas Concluídas por Subusuário */}
      {Object.keys(tasksByOwner).map((ownerName) => (
        <Box key={ownerName} sx={{ mt: 4 }}>
          <Typography variant="h6" align="center" sx={{ mb: 2, color: "white", backgroundColor: "rgb(16, 18, 24)", padding: 2, borderRadius: 4 }}>
            Tarefas Concluídas por {ownerName}
          </Typography>
          <Grid container spacing={2}>
            {concludedTasks
              .filter((task) => task.owner === ownerName)
              .map((task) => (
                <Grid item xs={12} sm={6} md={4} key={task.id}>
                  <Card sx={{ minWidth: 250, border: "1px solid #ccc", boxShadow: "none" }}>
                    <CardContent>
                      <Typography variant="h6">{task.description}</Typography>
                      <Button
                        variant="outlined"
                        color="secondary"
                        sx={{ fontSize: "0.8rem", padding: "4px 8px" }}
                        onClick={() => resetTask(task.id)}
                      >
                        Resetar
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Box>
      ))}
    </Container>
  );
}
