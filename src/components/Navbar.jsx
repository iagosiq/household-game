// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

export default function Navbar() {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
    });
    return () => unsubscribe();
  }, [auth]);

  // Define effectiveOwner: usa o displayName ou email, se disponível
  const effectiveOwner = user ? (user.displayName || user.email || "Usuário") : "";

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // Redireciona para a página inicial após deslogar
    } catch (err) {
      console.error("Erro ao sair:", err);
    }
  };

  // Função para alternar o Drawer (menu mobile)
  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  // Define os links do menu com base no estado do usuário
  const menuLinks = user
    ? [
        { label: "Dashboard", to: "/dashboard" },
        { label: "Tarefas", to: "/tasks" },
        { label: "Perfil", to: "/profile" },
        { label: "Lista de Compras", to: "/lista-de-compras" },
        { label: "Histórico", to: "/history" },
        { label: "Sair", to: "/", action: handleLogout },
      ]
    : [
        { label: "Login", to: "/login" },
        { label: "Cadastro", to: "/register" },
      ];

  return (
    <>
      <AppBar position="fixed" sx={{ width: "100%" }}>
        <Toolbar>
          {/* Ícone de Menu para mobile */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{ mr: 2, display: { xs: "block", sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          {/* Texto de boas-vindas visível apenas em mobile */}
          <Box sx={{ flexGrow: 1, display: { xs: "block", sm: "none" } }}>
            <Typography variant="h6" paddingTop={1.5} align="left" sx={{ mb: 2 }}>
              Bem-vindo(a) {effectiveOwner}
            </Typography>
          </Box>
          {/* Botões do menu visíveis apenas em desktop */}
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            {menuLinks.map((link, index) =>
              link.action ? (
                <Button key={index} color="inherit" onClick={link.action}>
                  {link.label}
                </Button>
              ) : (
                <Button key={index} color="inherit" component={Link} to={link.to}>
                  {link.label}
                </Button>
              )
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer para mobile */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
          <List>
            {menuLinks.map((link, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton
                  component={Link}
                  to={link.to}
                  onClick={link.action ? link.action : null}
                >
                  <ListItemText primary={link.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
