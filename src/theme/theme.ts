import { createTheme, alpha } from '@mui/material/styles';

// Palette de couleurs "Raiatea Premium"
const palette = {
  primary: {
    main: '#0F172A', // Slate 900 - Bleu nuit profond, très pro
    light: '#334155',
    dark: '#020617',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#0EA5E9', // Sky 500 - Bleu lagon vibrant
    light: '#38BDF8',
    dark: '#0284C7',
    contrastText: '#ffffff',
  },
  background: {
    default: '#F8FAFC', // Slate 50 - Gris très pâle, plus doux que le blanc
    paper: '#FFFFFF',
  },
  success: {
    main: '#10B981', // Emerald
  },
  warning: {
    main: '#F59E0B', // Amber
  },
  error: {
    main: '#EF4444', // Red
  },
  text: {
    primary: '#1E293B', // Slate 800
    secondary: '#64748B', // Slate 500
  },
};

export const theme = createTheme({
  palette,
  typography: {
    fontFamily: [
      '"Inter"',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 600, letterSpacing: '-0.01em' },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { letterSpacing: '0.01em' },
    button: { textTransform: 'none', fontWeight: 600 }, // Plus moderne sans majuscules forcées
  },
  shape: {
    borderRadius: 12, // Arrondis plus modernes (standard actuel: 12px)
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: '#94a3b8 #f1f5f9',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            backgroundColor: '#f1f5f9',
            width: '8px',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: '#94a3b8',
            minHeight: 24,
            border: '2px solid #f1f5f9',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          padding: '8px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', // Ombre douce au survol
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${palette.primary.main} 0%, ${palette.primary.light} 100%)`,
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${palette.secondary.main} 0%, ${palette.secondary.light} 100%)`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', // Ombre très diffuse "SaaS style"
          border: '1px solid rgba(226, 232, 240, 0.8)', // Bordure subtile
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Supprime l'effet overlay par défaut du Dark Mode MUI
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
        },
        elevation2: {
          boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.06)',
        },
        elevation3: {
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
            backgroundColor: '#fff',
            '& fieldset': {
              borderColor: '#E2E8F0', // Slate 200
            },
            '&:hover fieldset': {
              borderColor: '#94A3B8', // Slate 400
            },
            '&.Mui-focused fieldset': {
              borderColor: palette.secondary.main,
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#F8FAFC',
          color: '#475569',
          fontWeight: 600,
          borderBottom: '2px solid #E2E8F0',
        },
        body: {
          color: '#334155',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#0F172A',
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)', // Navbar blanche épurée
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0F172A', // Sidebar sombre pour contraste fort
          color: '#F8FAFC',
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: '#94A3B8',
        },
      },
    },
  },
});
