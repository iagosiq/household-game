// src/pages/History.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import { firestore } from "../firebase/firebase-config";
import { useAuth } from "../context/AuthContext";

export default function History() {
  const { currentUser } = useAuth();
  const [historyRecords, setHistoryRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Função para buscar os registros de histórico, ordenados do mais recente para o mais antigo
  const fetchHistory = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const historyQuery = query(
        collection(firestore, "history"),
        orderBy("date", "desc")
      );
      const querySnapshot = await getDocs(historyQuery);
      const records = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setHistoryRecords(records);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [currentUser]);

  // Função para "Iniciar Novo Dia":
  // Agrega as tarefas concluídas do usuário atual (excluindo as globais),
  // cria um registro de histórico e reseta as tarefas concluídas.
  const handleStartNewDay = async () => {
    if (!currentUser) return;
    try {
      // Busca as tarefas concluídas do usuário atual (excluindo tarefas com owner "global")
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
      
      // Agrupa as tarefas concluídas por subusuário
      const tasksByOwner = tasksData.reduce((acc, task) => {
        const owner = task.owner;
        if (!acc[owner]) acc[owner] = [];
        acc[owner].push(task.description);
        return acc;
      }, {});

      // Cria um registro de histórico
      await addDoc(collection(firestore, "history"), {
        userId: currentUser.uid,
        date: new Date(),
        tasksByOwner: tasksByOwner,
      });

      // Reseta as tarefas concluídas para o estado pendente (owner = "", completed = false)
      const batch = writeBatch(firestore);
      tasksData.forEach((task) => {
        const taskRef = doc(firestore, "tasks", task.id);
        batch.update(taskRef, { completed: false, owner: "" });
      });
      await batch.commit();
      fetchHistory();
      alert("Novo dia iniciado. Histórico atualizado e tarefas resetadas.");
    } catch (error) {
      console.error("Erro ao iniciar novo dia:", error);
      alert("Erro ao iniciar novo dia.");
    }
  };

  // Função para excluir um registro de histórico
  const handleDeleteHistory = async (recordId) => {
    try {
      await deleteDoc(doc(firestore, "history", recordId));
      fetchHistory();
    } catch (error) {
      console.error("Erro ao excluir histórico:", error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Histórico de Tarefas Concluídas
      </Typography>
      <Box display="flex" justifyContent="center" sx={{ mb: 4 }}>
        <Button variant="contained" color="primary" onClick={handleStartNewDay}>
          Iniciar Novo Dia
        </Button>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : historyRecords.length > 0 ? (
        historyRecords.map((record) => (
          <Card key={record.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">
                {new Date(record.date.seconds * 1000).toLocaleDateString()}
              </Typography>
              <Box sx={{ mt: 1 }}>
                {Object.keys(record.tasksByOwner).map((owner) => (
                  <Box key={owner} sx={{ mb: 1 }}>
                    <Typography variant="subtitle1">
                      {owner}: {record.tasksByOwner[owner].join(", ")}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => handleDeleteHistory(record.id)}
                >
                  Excluir Histórico
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography align="center">
          Nenhum histórico encontrado.
        </Typography>
      )}
    </Container>
  );
}
