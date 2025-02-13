// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

import { onCall } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

initializeApp();

export const createUser = onCall(async (request) => {
  const { email, password, displayName, birthdate } = request.data;

  if (!email || !password || !displayName) {
    throw new Error("Email, senha e nome são obrigatórios.");
  }

  try {
    const userRecord = await getAuth().createUser({
      email,
      password,
      displayName,
    });

    await getFirestore().collection("users").doc(userRecord.uid).set({
      name: displayName,
      email,
      birthdate: birthdate || null,
      createdAt: new Date(),
    });

    return { uid: userRecord.uid };
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    throw new Error(error.message);
  }
});

