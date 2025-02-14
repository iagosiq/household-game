// // src/pages/UserSelection.jsx
// import React, { useState, useEffect } from "react";
// import { Container, Box, Typography, List, ListItem, ListItemText, Button } from "@mui/material";
// import { doc, getDoc } from "firebase/firestore";
// import { firestore } from "../firebase/firebase-config";
// import { getAuth } from "firebase/auth";
// import { useNavigate } from "react-router-dom";

// export default function UserSelection() {
//   const auth = getAuth();
//   const user = auth.currentUser;
//   const navigate = useNavigate();
//   const [subUsers, setSubUsers] = useState([]);
//   const [selectedSubUser, setSelectedSubUser] = useState(null);

//   useEffect(() => {
//     const fetchSubUsers = async () => {
//       if (user) {
//         try {
//           const userDoc = await getDoc(doc(firestore, "users", user.uid));
//           if (userDoc.exists()) {
//             let subList = userDoc.data().subUsers || [];
//             // Adiciona o nome principal se não estiver na lista
//             if (user.displayName && !subList.includes(user.displayName)) {
//               subList.unshift(user.displayName);
//             }
//             setSubUsers(subList);
//           }
//         } catch (error) {
//           console.error("Erro ao buscar sub-usuários:", error);
//         }
//       }
//     };
//     fetchSubUsers();
//   }, [user]);

//   const handleSelect = (subUser) => {
//     setSelectedSubUser(subUser);
//   };

//   const handleConfirm = () => {
//     if (selectedSubUser) {
//       // Armazena o sub-usuário selecionado no localStorage (ou em um contexto)
//       localStorage.setItem("activeSubUser", selectedSubUser);
//       navigate("/dashboard");
//     }
//   };

//   return (
//     <Container maxWidth="sm" sx={{ mt: 4 }}>
//       <Typography variant="h5" align="center" gutterBottom>
//         Selecione seu perfil
//       </Typography>
//       {subUsers.length === 0 ? (
//         <Typography variant="body1" align="center">
//           Nenhum sub-usuário encontrado. Por favor, configure seus perfis.
//         </Typography>
//       ) : (
//         <Box>
//           <List>
//             {subUsers.map((subUser, index) => (
//               <ListItem
//                 key={index}
//                 button
//                 selected={selectedSubUser === subUser}
//                 onClick={() => handleSelect(subUser)}
//                 // Estilização customizada para destacar o item selecionado
//                 sx={{
//                   backgroundColor: selectedSubUser === subUser ? "primary.main" : "inherit",
//                   color: selectedSubUser === subUser ? "primary.contrastText" : "inherit",
//                   "&:hover": { backgroundColor: "primary.light" },
//                   mb: 1,
//                   borderRadius: 1,
//                 }}
//               >
//                 <ListItemText primary={subUser} />
//               </ListItem>
//             ))}
//           </List>
//           <Box sx={{ textAlign: "center", mt: 2 }}>
//             <Button variant="contained" disabled={!selectedSubUser} onClick={handleConfirm}>
//               Confirmar Seleção
//             </Button>
//           </Box>
//         </Box>
//       )}
//     </Container>
//   );
// }


// src/pages/UserSelection.jsx
import React, { useState, useEffect } from "react";
import { Container, Box, Typography, List, ListItem, ListItemText, Button } from "@mui/material";
import ListItemButton from "@mui/material/ListItemButton";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase-config";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function UserSelection() {
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();
  const [subUsers, setSubUsers] = useState([]);
  const [selectedSubUser, setSelectedSubUser] = useState(null);

  useEffect(() => {
    const fetchSubUsers = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(firestore, "users", user.uid));
          if (userDoc.exists()) {
            let subList = userDoc.data().subUsers || [];
            // Usa displayName ou email como nome principal
            const mainUserName = user.displayName || user.email;
            if (mainUserName && !subList.includes(mainUserName)) {
              subList.unshift(mainUserName);
            }
            setSubUsers(subList);
          }
        } catch (error) {
          console.error("Erro ao buscar sub-usuários:", error);
        }
      }
    };
    fetchSubUsers();
  }, [user]);

  const handleSelect = (subUser) => {
    setSelectedSubUser(subUser);
  };

  const handleConfirm = () => {
    if (selectedSubUser) {
      localStorage.setItem("activeSubUser", selectedSubUser);
      navigate("/dashboard");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Selecione seu perfil
      </Typography>
      {subUsers.length === 0 ? (
        <Typography variant="body1" align="center">
          Nenhum sub-usuário encontrado. Por favor, configure seus perfis.
        </Typography>
      ) : (
        <Box>
          <List>
            {subUsers.map((subUser, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton
                  selected={selectedSubUser === subUser}
                  onClick={() => handleSelect(subUser)}
                  sx={{
                    backgroundColor: selectedSubUser === subUser ? "primary.main" : "inherit",
                    color: selectedSubUser === subUser ? "primary.contrastText" : "inherit",
                    "&:hover": { backgroundColor: "primary.light" },
                    mb: 1,
                    borderRadius: 1,
                  }}
                >
                  <ListItemText primary={subUser} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Button variant="contained" disabled={!selectedSubUser} onClick={handleConfirm}>
              Confirmar Seleção
            </Button>
          </Box>
        </Box>
      )}
    </Container>
  );
}
