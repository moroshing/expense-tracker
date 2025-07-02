import { type ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import { Box, CircularProgress } from "@mui/material";

export default function AuthWrapper({ children }: { children: ReactNode }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff", // optional
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: currentUser
          ? "#ffffff"
          : "radial-gradient(circle at center, #ebf8ff, #bee3f8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {currentUser ? children : <AuthModal />}
    </Box>
  );
}
