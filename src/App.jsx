// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CssBaseline, Container } from "@mui/material";
import Home from "./pages/home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Profile from "./pages/Profile";
import History from "./pages/History";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import "./App.css";

export default function App() {
  return (
    <Router>
      <CssBaseline />
      {/* Navbar fixo para ocupar 100% da largura */}
      <Navbar />
      {/* Container com margin-top para compensar a Navbar fixa */}
      <Container maxWidth="lg" sx={{ mt: 12 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute component={<Dashboard />} />} />
          <Route path="/tasks" element={<PrivateRoute component={<Tasks />} />} />
          <Route path="/profile" element={<PrivateRoute component={<Profile />} />} />
          <Route path="/history" element={<PrivateRoute component={<History />} />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </Container>
    </Router>
  );
}

