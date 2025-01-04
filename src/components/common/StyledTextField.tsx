import { TextField, styled } from '@mui/material';

export const StyledTextField = styled(TextField)({
  '& .MuiInputBase-root': {
    backgroundColor: '#ffffff !important',
    '&.Mui-focused': {
      backgroundColor: '#ffffff !important',
    },
    '&:hover': {
      backgroundColor: '#ffffff !important',
    },
    '&.Mui-focused:hover': {
      backgroundColor: '#ffffff !important',
    },
    '& input': {
      backgroundColor: '#ffffff !important',
    },
    '& textarea': {
      backgroundColor: '#ffffff !important',
    },
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#e0e0e0',
    },
    '&:hover fieldset': {
      borderColor: '#FFD700',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#FFD700',
    },
  },
  '& .MuiFilledInput-root': {
    backgroundColor: '#ffffff !important',
    '&:hover': {
      backgroundColor: '#ffffff !important',
    },
    '&.Mui-focused': {
      backgroundColor: '#ffffff !important',
    },
  },
});
