// src/pages/Home.jsx
import React from "react";
import { Container, Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <Box
  sx={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "70vh",
  }}
>
  <Container maxWidth="sm">
    <Box sx={{ textAlign: "center" }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Bem-vindo ao OrganizApp
      </Typography>
      <Typography variant="h6" gutterBottom>
        Faça login ou cadastre-se para continuar.
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          sx={{ mr: 2 }}
          onClick={() => navigate("/login")}
        >
          Login
        </Button>
        <Button variant="outlined" color="primary" onClick={() => navigate("/register")}>
          Cadastro
        </Button>
      </Box>
    </Box>
  </Container>
</Box>

  );
}
