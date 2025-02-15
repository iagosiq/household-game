// src/context/ActiveSubUserContext.jsx
import { createContext, useState, useEffect } from "react";

export const ActiveSubUserContext = createContext();

export const ActiveSubUserProvider = ({ children }) => {
  const [activeSubUser, setActiveSubUser] = useState("global"); // Valor padrão "global"

  // Ao montar, tenta ler do localStorage
  useEffect(() => {
    const storedSubUser = localStorage.getItem("activeSubUser");
    if (storedSubUser) {
      try {
        // Tenta fazer o parse; se falhar, usa valor simples
        let parsedSubUser;
        if (storedSubUser.trim().startsWith("{")) {
          parsedSubUser = JSON.parse(storedSubUser);
        } else {
          parsedSubUser = { name: storedSubUser };
        }
        // Se o parsedSubUser tiver a propriedade "name", atualiza; caso contrário, mantém "global"
        if (parsedSubUser && parsedSubUser.name) {
          setActiveSubUser(parsedSubUser);
        }
      } catch (error) {
        console.error("Erro ao parsear o subusuário:", error);
        localStorage.removeItem("activeSubUser");
        setActiveSubUser("global");
      }
    }
  }, []);

  const updateActiveSubUser = (newSubUser) => {
    try {
      const serializedSubUser = JSON.stringify({ name: newSubUser });
      localStorage.setItem("activeSubUser", serializedSubUser);
      setActiveSubUser({ name: newSubUser });
      console.log("Subusuário atualizado:", { name: newSubUser });
    } catch (error) {
      console.error("Erro ao atualizar o subusuário:", error);
    }
  };

  return (
    <ActiveSubUserContext.Provider value={{ activeSubUser, updateActiveSubUser }}>
      {children}
    </ActiveSubUserContext.Provider>
  );
};
