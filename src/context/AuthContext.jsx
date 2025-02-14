import React, { createContext, useContext, useState } from "react";

// Criando o contexto
const AuthContext = createContext();

// Provedor do contexto
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para acessar o contexto
export function useAuth() {
  return useContext(AuthContext);
}


