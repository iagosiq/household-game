// src/pages/Dashboard.jsx
import React from "react";
import { Container, Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" gutterBottom>
          Aqui você pode visualizar suas tarefas, pontuações e outras informações.
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Button variant="contained" sx={{ mr: 2 }} onClick={() => navigate("/tasks")}>
            Gerenciar Tarefas
          </Button>
          <Button variant="outlined" onClick={() => navigate("/config")}>
            Configurações
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
