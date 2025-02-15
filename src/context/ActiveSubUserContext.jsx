// src/context/ActiveSubUserContext.jsx
import { createContext, useState } from "react";

export const ActiveSubUserContext = createContext();

export const ActiveSubUserProvider = ({ children }) => {
  // Inicia com "global" como padrão
  const [activeSubUser, setActiveSubUser] = useState("global");

  const updateActiveSubUser = (newSubUser) => {
    setActiveSubUser(newSubUser);
    console.log("Subusuário atualizado:", newSubUser);
  };

  return (
    <ActiveSubUserContext.Provider value={{ activeSubUser, updateActiveSubUser }}>
      {children}
    </ActiveSubUserContext.Provider>
  );
};
