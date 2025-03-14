
// // src/App.jsx
// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Home from "./pages/Home";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Dashboard from "./pages/Dashboard";
// import Tasks from "./pages/Tasks";
// import Profile from "./pages/Profile";
// import History from "./pages/History";
// import ListaDeCompras from "./pages/ListaDeCompras";
// import CreateUser from "./pages/CreateUser";
// import UserSelection from "./pages/UserSelection";
// import Navbar from "./components/Navbar";
// import PrivateRoute from "./components/PrivateRoute";
// import { CssBaseline, Container } from "@mui/material";
// import { ActiveSubUserProvider } from "./context/ActiveSubUserContext";
// import { AuthProvider } from "./context/AuthContext";
// import theme from "./theme"; // Importa o tema personalizado
// import { ThemeProvider } from "@mui/material/styles";


// export default function App() {
//   return (
//     <ThemeProvider theme={theme}>
//       <Router>
//         <CssBaseline />
//         <Navbar />
//         <AuthProvider>
//           <ActiveSubUserProvider>
//             <Container maxWidth="lg" sx={{ mt: 12 }}>
//               <Routes>
//                 <Route path="/login" element={<Login />} />
//                 <Route path="/register" element={<Register />} />
//                 <Route path="/dashboard" element={<PrivateRoute component={<Dashboard />} />} />
//                 <Route path="/tasks" element={<PrivateRoute component={<Tasks />} />} />
//                 <Route path="/profile" element={<PrivateRoute component={<Profile />} />} />
//                 <Route path="/history" element={<PrivateRoute component={<History />} />} />
//                 <Route path="/lista-de-compras" element={<PrivateRoute component={<ListaDeCompras />} />} />
//                 <Route path="/create-user" element={<PrivateRoute component={<CreateUser />} />} />
//                 <Route path="/user-selection" element={<PrivateRoute component={<UserSelection />} />} />
//                 <Route path="/" element={<Home />} />
//               </Routes>
//             </Container>
//           </ActiveSubUserProvider>
//         </AuthProvider>
//       </Router>
//     </ThemeProvider>
//   );
// }




import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Profile from "./pages/Profile";
import History from "./pages/History";
import ListaDeCompras from "./pages/ListaDeCompras";
import CreateUser from "./pages/CreateUser";
import UserSelection from "./pages/UserSelection";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import { CssBaseline, Container } from "@mui/material";
import { ActiveSubUserProvider } from "./context/ActiveSubUserContext";
import { AuthProvider } from "./context/AuthContext";
import theme from "./theme";
import { ThemeProvider } from "@mui/material/styles";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <CssBaseline />
        <ActiveSubUserProvider>
          <AuthProvider>
            {/* Navbar agora está dentro do contexto certo */}
            <Navbar />
            <Container maxWidth="lg" sx={{ mt: 12 }}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<PrivateRoute component={<Dashboard />} />} />
                <Route path="/tasks" element={<PrivateRoute component={<Tasks />} />} />
                <Route path="/profile" element={<PrivateRoute component={<Profile />} />} />
                <Route path="/history" element={<PrivateRoute component={<History />} />} />
                <Route path="/lista-de-compras" element={<PrivateRoute component={<ListaDeCompras />} />} />
                <Route path="/create-user" element={<PrivateRoute component={<CreateUser />} />} />
                <Route path="/user-selection" element={<PrivateRoute component={<UserSelection />} />} />
                <Route path="/" element={<Home />} />
              </Routes>
            </Container>
          </AuthProvider>
        </ActiveSubUserProvider>
      </Router>
    </ThemeProvider>
  );
}
