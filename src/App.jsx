// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CssBaseline, Container } from "@mui/material";
// Paginas
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import Tasks from "./pages/Tasks";
import Home from "./pages/home";

export default function App() {
  return (
    <Router>
      <CssBaseline />
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute component={<Dashboard />} />} />
          <Route path="/history" element={<PrivateRoute component={<History />} />} />
          <Route path="/tasks" element={<PrivateRoute component={<Tasks />} />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </Container>
    </Router>
  );
}
