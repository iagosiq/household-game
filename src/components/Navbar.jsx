import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

export default function Navbar() {
  const auth = getAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Erro ao sair:", err);
    }
  };

  return (
    <AppBar position="fixed" sx={{ width: "100%" }}>
      <Toolbar>
        {user ? (
          <Box>
            <Button color="inherit" component={Link} to="/dashboard">
              Dashboard
            </Button>
            <Button color="inherit" component={Link} to="/tasks">
              Tarefas
            </Button>
            <Button color="inherit" component={Link} to="/profile">
              Perfil
            </Button>
            <Button color="inherit" onClick={handleLogout} component={Link} to="/login">
              Sair
            </Button>
          </Box>
        ) : (
          <Box>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Cadastro
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
