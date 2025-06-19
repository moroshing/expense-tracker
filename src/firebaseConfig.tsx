import { getDatabase } from "firebase/database";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDj8RbfQh7QFYS6lY_jSnOJPAY2r3LJbPw",
  authDomain: "moro-expense-tracker.firebaseapp.com",
  databaseURL:
    "https://moro-expense-tracker-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "moro-expense-tracker",
  storageBucket: "moro-expense-tracker.firebasestorage.app",
  messagingSenderId: "599206938404",
  appId: "1:599206938404:web:190cad4732fbe5b16f55b1",
  measurementId: "G-0X0HQLQRM5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { db, auth, googleProvider };
