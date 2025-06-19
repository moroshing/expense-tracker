import { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Stack,
} from "@mui/material";
import { Google } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 420,
  bgcolor: "background.paper",
  boxShadow: 8,
  borderRadius: 3,
  p: 4,
};

export default function AuthModal() {
  const [open, setOpen] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, googleLogin } = useAuth();

  const handleClose = () => setOpen(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      handleClose();
    } catch (error) {
      alert("Failed to login: " + error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
      handleClose();
    } catch (error) {
      alert("Failed to login with Google: " + error);
    }
  };

  return (
    <Modal
      open={open}
      onClose={(_, reason) => {
        if (reason !== "backdropClick") {
          setOpen(false);
        }
      }}
    >
      <Box sx={style}>
        <Typography
          variant="overline"
          align="center"
          display="block"
          color="primary"
          fontWeight={700}
          letterSpacing={1}
          mb={1}
        >
          Finify.io
        </Typography>
        <Typography variant="h6" align="center" fontWeight={600} mb={1.5}>
          Sign In
        </Typography>
        <Typography
          variant="body2"
          align="center"
          color="text.secondary"
          mb={3}
        >
          Track your income and expenses seamlessly
        </Typography>

        <form onSubmit={handleLogin}>
          <Stack spacing={2}>
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              variant="outlined"
              autoFocus
              InputProps={{ sx: { borderRadius: 2 } }}
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              variant="outlined"
              InputProps={{ sx: { borderRadius: 2 } }}
              required
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
                py: 1.2,
              }}
            >
              LOGIN
            </Button>
          </Stack>
        </form>

        <Divider sx={{ my: 3 }}>or</Divider>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<Google />}
          onClick={handleGoogleLogin}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 500,
            py: 1.2,
          }}
        >
          Continue with Google
        </Button>
      </Box>
    </Modal>
  );
}
