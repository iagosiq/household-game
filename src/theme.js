// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#101218', // Sua cor primária desejada
      contrastText: '#fff',
    },
    secondary: {
      main: '#ff4081',
    },
    background: {
      default: '#f5f5f5', // Cor de fundo global
    },
  },
  typography: {
    fontFamily: "'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f5f5f5', // Garante o fundo no body
          margin: 0,
          padding: 0,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none',       // Remove a sombra padrão
          border: '1px solid #ccc', // Adiciona uma borda sutil
          borderRadius: '8px',      // Bordas arredondadas (opcional)
          backgroundColor: '#f5f5f5', // Cor de fundo do Card
          '&:hover': {
            backgroundColor: '#e0e0e0', // Cor de fundo ao passar o mouse
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Mantém a formatação do texto
          fontWeight: 500,
          '&:hover': {
            backgroundColor: '#535f6b', // Exemplo: cor de hover para o botão (pode usar uma cor derivada do primary-hover)
          },
        },
      },
    },
  },
});

export default theme;
