// src/pages/History.jsx
import React, { useState, useEffect } from "react";
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
  CircularProgress,
} from "@mui/material";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase-config";
import { getAuth } from "firebase/auth";

export default function History() {
  const [weeklyScores, setWeeklyScores] = useState([]);
  const [raffleWinners, setRaffleWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWinnerPopup, setShowWinnerPopup] = useState(false);
  const [currentRaffle, setCurrentRaffle] = useState(null);

  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Função para buscar pontuações semanais
  const fetchWeeklyScores = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, "weeklyScores"));
      const scores = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWeeklyScores(scores);
    } catch (error) {
      console.error("Erro ao buscar pontuações:", error);
    }
  };

  // Função para buscar ganhadores do sorteio mensal
  const fetchRaffleWinners = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, "raffleWinners"));
      const winners = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRaffleWinners(winners);

      // Verifica se há um sorteio para o mês atual
      const currentMonth = new Date().toISOString().slice(0, 7); // Exemplo: "2023-04"
      const raffleForCurrentMonth = winners.find((raffle) => raffle.month === currentMonth);
      if (raffleForCurrentMonth && currentUser && raffleForCurrentMonth.winnerUserId === currentUser.uid && !raffleForCurrentMonth.popupShown) {
        setCurrentRaffle(raffleForCurrentMonth);
        setShowWinnerPopup(true);
      }
    } catch (error) {
      console.error("Erro ao buscar ganhadores do sorteio:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchWeeklyScores();
      await fetchRaffleWinners();
      setLoading(false);
    };
    fetchData();
  }, [currentUser]);

  // Função para fechar o popup e atualizar o campo popupShown
  const handleClosePopup = async () => {
    if (currentRaffle) {
      const raffleRef = doc(firestore, "raffleWinners", currentRaffle.id);
      try {
        await updateDoc(raffleRef, { popupShown: true });
      } catch (error) {
        console.error("Erro ao atualizar o popupShown:", error);
      }
    }
    setShowWinnerPopup(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Histórico de Pontuações e Sorteios
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Pontuações Semanais
            </Typography>
            {weeklyScores.length > 0 ? (
              <List>
                {weeklyScores.map((score) => (
                  <ListItem key={score.id}>
                    <ListItemText
                      primary={`Usuário: ${score.userId}`}
                      secondary={`Semana: ${score.week} - Pontos: ${score.points}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2">Nenhuma pontuação encontrada.</Typography>
            )}
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Sorteios Mensais
            </Typography>
            {raffleWinners.length > 0 ? (
              <List>
                {raffleWinners.map((raffle) => (
                  <ListItem key={raffle.id}>
                    <ListItemText
                      primary={`Mês: ${raffle.month}`}
                      secondary={`Ganhador: ${raffle.winnerUserId}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2">Nenhum sorteio realizado.</Typography>
            )}
          </Box>
        </>
      )}

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
