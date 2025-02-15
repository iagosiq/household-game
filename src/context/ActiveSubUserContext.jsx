// src/context/ActiveSubUserContext.jsx
import { createContext, useState, useEffect } from "react";

export const ActiveSubUserContext = createContext();

export const ActiveSubUserProvider = ({ children }) => {
  // Inicia com "global" como padrão
  const [activeSubUser, setActiveSubUser] = useState("global");

  useEffect(() => {
    const storedSubUser = localStorage.getItem("activeSubUser");
    if (storedSubUser) {
      setActiveSubUser(storedSubUser);
    }
  }, []);

  const updateActiveSubUser = (newSubUser) => {
    localStorage.setItem("activeSubUser", newSubUser);
    setActiveSubUser(newSubUser);
    console.log("Subusuário atualizado:", newSubUser);
  };

  return (
    <ActiveSubUserContext.Provider value={{ activeSubUser, updateActiveSubUser }}>
      {children}
    </ActiveSubUserContext.Provider>
  );
};
