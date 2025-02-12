// src/pages/History.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from "@mui/material";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase-config";
import { getAuth } from "firebase/auth";

export default function History() {
  const [weeklyScores, setWeeklyScores] = useState([]);
  const [raffleWinners, setRaffleWinners] = useState([]);
  const [showWinnerPopup, setShowWinnerPopup] = useState(false);
  const [currentWinner, setCurrentWinner] = useState(null);

  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchWeeklyScores = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "weeklyScores"));
        const scoresData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setWeeklyScores(scoresData);
      } catch (error) {
        console.error("Erro ao buscar pontuações semanais:", error);
      }
    };

    const fetchRaffleWinners = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "raffleWinners"));
        const winnersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRaffleWinners(winnersData);

        // Exibir popup se o usuário atual for o ganhador do mês atual e ainda não tiver visto o popup.
        const currentMonth = new Date().toISOString().slice(0, 7); // Ex.: "2023-04"
        const currentRaffle = winnersData.find((item) => item.month === currentMonth);
        if (currentRaffle && currentUser && currentRaffle.winnerUserId === currentUser.uid && !currentRaffle.popupShown) {
          setCurrentWinner(currentRaffle);
          setShowWinnerPopup(true);
        }
      } catch (error) {
        console.error("Erro ao buscar ganhadores do sorteio:", error);
      }
    };

    fetchWeeklyScores();
    fetchRaffleWinners();
  }, [currentUser]);

  // Função para fechar o popup do sorteio e atualizar o campo popupShown
  const handleClosePopup = async () => {
    if (currentWinner) {
      const winnerRef = doc(firestore, "raffleWinners", currentWinner.id);
      try {
        await updateDoc(winnerRef, { popupShown: true });
      } catch (error) {
        console.error("Erro ao atualizar popupShown:", error);
      }
    }
    setShowWinnerPopup(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Histórico de Pontuações e Sorteios
      </Typography>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Pontuações Semanais
        </Typography>
        <List>
          {weeklyScores.length > 0 ? (
            weeklyScores.map((score) => (
              <ListItem key={score.id}>
                <ListItemText
                  primary={`Usuário: ${score.userId}`}
                  secondary={`Semana: ${score.week} - Pontos: ${score.points}`}
                />
              </ListItem>
            ))
          ) : (
            <Typography variant="body2">Nenhuma pontuação encontrada.</Typography>
          )}
        </List>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Ganhadores do Sorteio Mensal
        </Typography>
        <List>
          {raffleWinners.length > 0 ? (
            raffleWinners.map((winner) => (
              <ListItem key={winner.id}>
                <ListItemText
                  primary={`Mês: ${winner.month}`}
                  secondary={`Ganhador: ${winner.winnerUserId}`}
                />
              </ListItem>
            ))
          ) : (
            <Typography variant="body2">Nenhum sorteio realizado.</Typography>
          )}
        </List>
      </Box>

      <Dialog open={showWinnerPopup} onClose={handleClosePopup}>
        <DialogTitle>Parabéns!</DialogTitle>
        <DialogContent>
          <Typography>
            Você foi o ganhador do sorteio deste mês!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePopup}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
