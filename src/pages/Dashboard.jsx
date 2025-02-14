// // src/pages/Dashboard.jsx
// import React, { useEffect, useState } from "react";
// import { Container, Grid, Card, CardContent, Typography, CircularProgress, Button } from "@mui/material";
// import { collection, getDocs } from "firebase/firestore";
// import { firestore } from "../firebase/firebase-config";
// import { useNavigate } from "react-router-dom";

// export default function Dashboard() {
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   const fetchTasks = async () => {
//     setLoading(true);
//     try {
//       const querySnapshot = await getDocs(collection(firestore, "tasks"));
//       const tasksData = querySnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setTasks(tasksData);
//     } catch (error) {
//       console.error("Erro ao buscar tarefas:", error);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchTasks();
//   }, []);

//   return (
//     <Container maxWidth="lg" sx={{ mt: 4 }}>
//       <Typography variant="h4" gutterBottom align="center">
//         Dashboard
//       </Typography>
//       {loading ? (
//         <Grid container justifyContent="center">
//           <CircularProgress />
//         </Grid>
//       ) : (
//         <Grid container spacing={2}>
//           {tasks.length ? (
//             tasks.map((task) => (
//               <Grid item xs={12} sm={6} md={4} key={task.id}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6">{task.description}</Typography>
//                     <Typography color="text.secondary">
//                       Pontos: {task.points} - Periodicidade: {task.periodicity} dia(s)
//                     </Typography>
//                     <Typography variant="body2">Owner: {task.owner}</Typography>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             ))
//           ) : (
//             <Grid item xs={12}>
//               <Typography align="center">Nenhuma tarefa encontrada.</Typography>
//             </Grid>
//           )}
//         </Grid>
//       )}
//       <Grid container justifyContent="center" sx={{ mt: 4 }}>
//         <Button variant="contained" onClick={() => navigate("/tasks")}>
//           Gerenciar Tarefas
//         </Button>
//       </Grid>
//     </Container>
//   );
// }


import React, { useEffect, useState } from "react";
import { 
  Container, Grid, Card, CardContent, Typography, 
  CircularProgress, Button 
} from "@mui/material";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase-config";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Importa o contexto de autenticação

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth(); // Obtendo usuário autenticado
  const navigate = useNavigate();

  // Função para buscar tarefas
  const fetchTasks = async () => {
    if (!currentUser) return; // Evita chamar a função se o usuário não estiver autenticado

    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(firestore, "tasks"));
      const tasksData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("Usuário autenticado:", currentUser);
      console.log("Tarefas carregadas:", tasksData);

      // Filtra tarefas para incluir as do usuário e as globais
      const filteredTasks = tasksData.filter(
        (task) => task.owner === "global" || task.owner === currentUser.uid
      );

      console.log("Tarefas filtradas:", filteredTasks);
      setTasks(filteredTasks);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (currentUser) {
      fetchTasks();
    }
  }, [currentUser]); // 🔹 Agora ele busca as tarefas quando o usuário muda

  // Função para marcar uma tarefa como concluída
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
                    <Typography 
                      variant="body2" 
                      color={task.completed ? "green" : "red"}
                    >
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
