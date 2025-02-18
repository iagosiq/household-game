import { createContext, useState, useEffect } from "react";

export const ActiveSubUserContext = createContext();

export const ActiveSubUserProvider = ({ children }) => {
  const [activeSubUser, setActiveSubUser] = useState(null);

  // Ao montar, tenta carregar o subusuário do localStorage
  useEffect(() => {
    const storedSubUser = localStorage.getItem("activeSubUser");
    if (storedSubUser) {
      try {
        let parsedSubUser;
        // Se o valor armazenado começar com "{" assume JSON; senão, trata como string simples
        if (storedSubUser.trim().startsWith("{")) {
          parsedSubUser = JSON.parse(storedSubUser);
        } else {
          parsedSubUser = { name: storedSubUser };
        }
        setActiveSubUser(parsedSubUser);
      } catch (error) {
        console.error("Erro ao parsear o subusuário:", error);
        localStorage.removeItem("activeSubUser");
        setActiveSubUser(null);
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
