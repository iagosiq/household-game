// src/App.jsx
import React, { useEffect } from "react";
import "./App.css";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "./firebase-config";

function App() {
  useEffect(() => {
    const addTestDocument = async () => {
      try {
        const docRef = await addDoc(collection(firestore, "test"), {
          name: "Teste Firebase",
          email: "teste@exemplo.com",
          timestamp: serverTimestamp(),
        });
        console.log("Documento inserido com sucesso! ID:", docRef.id);
      } catch (error) {
        console.error("Erro ao inserir documento:", error);
      }
    };

    addTestDocument();
  }, []);

  return (
    <div className="App">
      <h1>Teste de Integração com Firebase</h1>
      <p>Verifique o console do navegador e o Firestore no Firebase Console.</p>
    </div>
  );
}

export default App;
