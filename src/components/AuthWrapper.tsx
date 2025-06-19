import { type ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

export default function AuthWrapper({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <AuthModal />;
  }

  return <>{children}</>;
}
