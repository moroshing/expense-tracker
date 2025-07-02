import { createContext, useContext, useEffect, useState } from "react";
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  EmailAuthProvider,
  linkWithCredential,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth, googleProvider } from "../firebaseConfig";

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setCurrentUser(user);
          setLoading(false);
        });
        return unsubscribe;
      } catch (error) {
        console.error("Failed to set auth persistence:", error);
        setLoading(false);
      }
    };

    const unsubPromise = initAuth();

    return () => {
      unsubPromise.then((unsub) => {
        if (typeof unsub === "function") unsub();
      });
    };
  }, []);

  const register = async (email: string, password: string): Promise<void> => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function googleLogin() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleEmail = result.user.email;

      if (!googleEmail) return;

      // Check sign-in methods for this email
      const signInMethods = await fetchSignInMethodsForEmail(auth, googleEmail);
      const hasPasswordAccount = signInMethods.includes("password");

      if (hasPasswordAccount && !currentUser) {
        // User has password account but is not logged in
        // Can't link automatically, so ask user to login first
        throw new Error(
          "An account with this email already exists. Please log in with your email and password first, then link Google."
        );
      }

      if (hasPasswordAccount && currentUser) {
        // User is logged in with email/password and now trying to link Google

        // Ask user for password to confirm linking
        const password = prompt(
          "Enter your password to link Google with your account"
        );
        if (!password) throw new Error("Password required to link accounts.");

        const emailCredential = EmailAuthProvider.credential(
          googleEmail,
          password
        );
        const googleCredential =
          GoogleAuthProvider.credentialFromResult(result);
        if (!googleCredential) throw new Error("Invalid Google credential");

        // Link Google credential to current user
        await linkWithCredential(currentUser, googleCredential);
        // Optionally, you can also link the email/password credential if needed:
        // await linkWithCredential(currentUser, emailCredential);
      }

      // If user is new or google-only, no problem - login continues
    } catch (error) {
      console.error("Google Login Error:", error);
      throw error; // pass error to UI
    }
  }

  async function logout() {
    await signOut(auth);
  }

  const value = {
    currentUser,
    login,
    googleLogin,
    logout,
    loading,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
