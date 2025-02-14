
// import React, { useState, useEffect } from "react";
// import { Container, Box, TextField, Button, Typography, Alert } from "@mui/material";
// import { getAuth, updateEmail, updatePassword, updateProfile } from "firebase/auth";
// import { doc, getDoc, updateDoc } from "firebase/firestore";
// import { firestore } from "../firebase/firebase-config";
// import SubUsersManager from "../components/SubUsersManager";

// export default function Profile() {
//   const auth = getAuth();
//   const user = auth.currentUser;
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [birthdate, setBirthdate] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   // Carrega os dados do usuário (do Firestore ou Auth) ao montar a página
//   useEffect(() => {
//     const fetchUserData = async () => {
//       if (user) {
//         try {
//           const userDoc = await getDoc(doc(firestore, "users", user.uid));
//           if (userDoc.exists()) {
//             const data = userDoc.data();
//             setName(data.name || user.displayName || "");
//             setEmail(data.email || user.email || "");
//             setBirthdate(data.birthdate || ""); // Formato YYYY-MM-DD
//           } else {
//             setName(user.displayName || "");
//             setEmail(user.email || "");
//           }
//         } catch (err) {
//           console.error("Erro ao buscar dados do usuário:", err);
//         }
//       }
//     };
//     fetchUserData();
//   }, [user]);

//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");
//     try {
//       if (email !== user.email) {
//         await updateEmail(user, email);
//       }
//       if (password) {
//         await updatePassword(user, password);
//       }
//       if (name !== user.displayName) {
//         await updateProfile(user, { displayName: name });
//       }
//       await updateDoc(doc(firestore, "users", user.uid), {
//         name,
//         email,
//         birthdate,
//       });
//       setSuccess("Perfil atualizado com sucesso!");
//     } catch (err) {
//       setError("Erro ao atualizar perfil. Tente novamente.");
//       console.error("Erro de atualização:", err);
//     }
//   };

//   return (
//     <Container maxWidth="sm" sx={{ mt: 4 }}>
//       <Typography variant="h5" align="center" gutterBottom>
//         Editar Perfil
//       </Typography>
//       {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
//       {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
//       <Box component="form" onSubmit={handleUpdate} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//         <TextField
//           label="Nome"
//           variant="outlined"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           fullWidth
//           required
//         />
//         <TextField
//           label="Email"
//           variant="outlined"
//           type="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           fullWidth
//           required
//         />
//         <TextField
//           label="Senha (deixe em branco se não alterar)"
//           variant="outlined"
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           fullWidth
//         />
//         <TextField
//           label="Data de Nascimento"
//           variant="outlined"
//           type="date"
//           InputLabelProps={{ shrink: true }}
//           value={birthdate}
//           onChange={(e) => setBirthdate(e.target.value)}
//           fullWidth
//           required
//         />
//         <Button type="submit" variant="contained">
//           Atualizar Perfil
//         </Button>
//       </Box>
//       {/* Componente para gerenciar sub-usuários */}
//       {user && <SubUsersManager userId={user.uid} />}
//     </Container>
//   );
// }



// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { Container, Box, TextField, Button, Typography, Alert } from "@mui/material";
import { getAuth, updateEmail, updatePassword, updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase-config";
import SubUsersManager from "../components/SubUsersManager";

export default function Profile() {
  const auth = getAuth();
  const user = auth.currentUser;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(firestore, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setName(data.name || user.displayName || "");
            setEmail(data.email || user.email || "");
            // Verifica se o valor de data.birthdate é uma data válida
            const fetchedBirthdate = data.birthdate;
            // Se Date.parse não conseguir converter, retorna NaN
            const validBirthdate = !isNaN(Date.parse(fetchedBirthdate)) ? fetchedBirthdate : "";
            setBirthdate(validBirthdate);
          } else {
            setName(user.displayName || "");
            setEmail(user.email || "");
          }
        } catch (err) {
          console.error("Erro ao buscar dados do usuário:", err);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      if (email !== user.email) {
        await updateEmail(user, email);
      }
      if (password) {
        await updatePassword(user, password);
      }
      if (name !== user.displayName) {
        await updateProfile(user, { displayName: name });
      }
      await updateDoc(doc(firestore, "users", user.uid), {
        name,
        email,
        birthdate,
      });
      setSuccess("Perfil atualizado com sucesso!");
    } catch (err) {
      setError("Erro ao atualizar perfil. Tente novamente.");
      console.error("Erro de atualização:", err);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Editar Perfil
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Box component="form" onSubmit={handleUpdate} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Nome"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Email"
          variant="outlined"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Senha (deixe em branco se não alterar)"
          variant="outlined"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
        />
        <TextField
          label="Data de Nascimento"
          variant="outlined"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          fullWidth
          required
        />
        <Button type="submit" variant="contained">
          Atualizar Perfil
        </Button>
      </Box>
      {user && <SubUsersManager userId={user.uid} />}
    </Container>
  );
}
