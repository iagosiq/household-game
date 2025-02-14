// src/context/ActiveSubUserContext.jsx
import React, { createContext, useState, useEffect } from "react";

// Cria o contexto
export const ActiveSubUserContext = createContext();

// Provedor do contexto
export function ActiveSubUserProvider({ children }) {
  // Tenta carregar do localStorage, se existir
  const [activeSubUser, setActiveSubUser] = useState(() => {
    return localStorage.getItem("activeSubUser") || "";
  });

  // Sempre que activeSubUser mudar, atualiza no localStorage
  useEffect(() => {
    localStorage.setItem("activeSubUser", activeSubUser);
  }, [activeSubUser]);

  return (
    <ActiveSubUserContext.Provider value={{ activeSubUser, setActiveSubUser }}>
      {children}
    </ActiveSubUserContext.Provider>
  );
}
