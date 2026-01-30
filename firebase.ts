
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// NOTE: These environment variables must be provided in the host environment
const firebaseConfig = {
  apiKey: (window as any).env?.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDummyKey-For-Setup",
  authDomain: (window as any).env?.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "major-ai-trinity.firebaseapp.com",
  projectId: (window as any).env?.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "major-ai-trinity",
  storageBucket: (window as any).env?.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "major-ai-trinity.appspot.com",
  messagingSenderId: (window as any).env?.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: (window as any).env?.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
