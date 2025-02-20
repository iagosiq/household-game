import React, { useState, useEffect, useContext } from "react";
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
import { ActiveSubUserContext } from "../context/ActiveSubUserContext"; // Verifique se o caminho está correto!

export default function Navbar() {
  const auth = getAuth();
  const navigate = useNavigate();
  const activeSubUserContext = useContext(ActiveSubUserContext); // Evita erro se o contexto for undefined
  const [user, setUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
    });
    return () => unsubscribe();
  }, []);

  // Garante que não haja erro ao acessar activeSubUser
  const effectiveOwner =
    activeSubUserContext?.activeSubUser?.name || user?.displayName || user?.email || "Usuário";

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // Redireciona para a página inicial após deslogar
    } catch (err) {
      console.error("Erro ao sair:", err);
    }
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const menuLinks = user
    ? [
        { label: "Dashboard", to: "/dashboard" },
        { label: "Tarefas", to: "/tasks" },
        { label: "Lista de Compras", to: "/lista-de-compras" },
        { label: "Histórico", to: "/history" },
        { label: "Perfil", to: "/profile" },
        { label: "Sair", to: "#", action: handleLogout },
      ]
    : [
        { label: "Login", to: "/login" },
        { label: "Cadastro", to: "/register" },
      ];

  return (
    <>
      <AppBar position="fixed" sx={{ width: "100%", height: "90px" }}>
        <Toolbar sx={{ height: "100%", display: "flex", alignItems: "center" }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{ mr: 2, display: { xs: "block", sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo ou título centralizado */}
          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
              <Typography variant="h4" sx={{ display: "flex", alignItems: "center" }}>
                OrganizApp
              </Typography>
          </Box>

          {/* Links do menu */}
          <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 2 }}>
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



      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
          <List>
            {menuLinks.map((link, index) => (
              <ListItem key={index} disablePadding>
                {link.action ? (
                  <ListItemButton onClick={link.action}>
                    <ListItemText primary={link.label} />
                  </ListItemButton>
                ) : (
                  <ListItemButton component={Link} to={link.to}>
                    <ListItemText primary={link.label} />
                  </ListItemButton>
                )}
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}





