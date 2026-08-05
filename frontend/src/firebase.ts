import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDa3ZdOCXf_z4O-uhXT4mm7_nLJCJiVJRI",
  authDomain: "ai-interactive-course-engine.firebaseapp.com",
  projectId: "ai-interactive-course-engine",
  storageBucket: "ai-interactive-course-engine.firebasestorage.app",
  messagingSenderId: "127650147797",
  appId: "1:127650147797:web:4696aab63ff6c7fcb5a15c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
