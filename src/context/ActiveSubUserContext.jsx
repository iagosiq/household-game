// src/context/ActiveSubUserContext.jsx
import { createContext, useState } from "react";

export const ActiveSubUserContext = createContext();

export const ActiveSubUserProvider = ({ children }) => {
  const [activeSubUser, setActiveSubUser] = useState(null);

  const updateActiveSubUser = (newSubUser) => {
    // Armazena apenas em memória
    setActiveSubUser({ name: newSubUser });
    console.log("Subusuário atualizado:", { name: newSubUser });
  };

  return (
    <ActiveSubUserContext.Provider value={{ activeSubUser, updateActiveSubUser }}>
      {children}
    </ActiveSubUserContext.Provider>
  );
};

