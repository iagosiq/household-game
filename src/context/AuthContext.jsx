// import React, { createContext, useContext, useState } from "react";

// // Criando o contexto
// const AuthContext = createContext();

// // Provedor do contexto
// export function AuthProvider({ children }) {
//   const [currentUser, setCurrentUser] = useState(null);

//   return (
//     <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// // Hook personalizado para acessar o contexto
// export function useAuth() {
//   return useContext(AuthContext);
// }


// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase-config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
