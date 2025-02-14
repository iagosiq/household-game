// // src/App.jsx
// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Home from "./pages/home";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Dashboard from "./pages/Dashboard";
// import Tasks from "./pages/Tasks";
// import Profile from "./pages/Profile";
// import History from "./pages/History";
// import CreateUser from "./pages/CreateUser";
// import Navbar from "./components/Navbar";
// import PrivateRoute from "./components/PrivateRoute";
// import UserSelection from "./pages/UserSelection";

// import { CssBaseline, Container } from "@mui/material";
// import "./App.css";

// export default function App() {
//   return (
//     <Router>
//       <CssBaseline />
//       <Navbar />
//       <Container maxWidth="lg" sx={{ mt: 12 }}>
//         <Routes>
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/dashboard" element={<PrivateRoute component={<Dashboard />} />} />
//           <Route path="/tasks" element={<PrivateRoute component={<Tasks />} />} />
//           <Route path="/profile" element={<PrivateRoute component={<Profile />} />} />
//           <Route path="/history" element={<PrivateRoute component={<History />} />} />
//           <Route path="/create-user" element={<PrivateRoute component={<CreateUser />} />} />
//           <Route path="/user-selection" element={<privateRoute component={<UserSelection />} />} />
//           <Route path="/" element={<Home />} />
//         </Routes>
//       </Container>
//     </Router>
//   );
// }

// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Profile from "./pages/Profile";
import History from "./pages/History";
import CreateUser from "./pages/CreateUser";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import UserSelection from "./pages/UserSelection";

import { CssBaseline, Container } from "@mui/material";
import "./App.css";

export default function App() {
  return (
    <Router>
      <CssBaseline />
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 12 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute component={<Dashboard />} />} />
          <Route path="/tasks" element={<PrivateRoute component={<Tasks />} />} />
          <Route path="/profile" element={<PrivateRoute component={<Profile />} />} />
          <Route path="/history" element={<PrivateRoute component={<History />} />} />
          <Route path="/create-user" element={<PrivateRoute component={<CreateUser />} />} />
          {/* Corrigindo a rota para UserSelection com a letra maiúscula em PrivateRoute e usando o mesmo case na URL */}
          <Route path="/user-selection" element={<PrivateRoute component={<UserSelection />} />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </Container>
    </Router>
  );
}
