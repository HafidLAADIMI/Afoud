// utils/auth.ts
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail as firebaseSendResetEmail,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User
} from 'firebase/auth';
import {
    getFirestore,
    doc,
    getDoc,
    setDoc
} from 'firebase/firestore';

// --- 1) Firebase init ---
const firebaseConfig = {

     apiKey: "AIzaSyA0HdeDYIv38UHICf7tsFaXWtFNG_5WUSE",
  authDomain: "afood-a8ea4.firebaseapp.com",
  projectId: "afood-a8ea4",
  storageBucket: "afood-a8ea4.firebasestorage.app",
  messagingSenderId: "555100471697",
  appId: "1:555100471697:web:c259b06146389fa9901a30"

};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth };

// --- 2) Firestore profile loader ---
export type UserProfile = {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
};

export const getUserProfileFromFirestore = async (uid: string): Promise<UserProfile | null> => {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
};

// --- 3) Subscribe to auth changes ---
export const subscribeToAuthChanges = (
    onChange: (user: User | null) => void,
    onFinish: (loading: boolean) => void
) => {
    return onAuthStateChanged(auth, user => {
        onChange(user);
        onFinish(false);
    });
};

// --- 4) Simple email auth ---
export const signInWithEmail = async (email: string, password: string) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        return { error: null };
    } catch (error: any) {
        return { error };
    }
};

export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', cred.user.uid), {
            uid: cred.user.uid,
            displayName,
            email: cred.user.email
        });
        return { error: null };
    } catch (error: any) {
        return { error };
    }
};

// --- 5) Password reset & sign out ---
export const sendResetPasswordEmail = async (email: string) => {
    await firebaseSendResetEmail(auth, email);
    return true;
};

export const signOut = async () => {
    await firebaseSignOut(auth);
    return true;
};

// --- 8) Current user getters ---
export const getCurrentUser = async (): Promise<User | null> => auth.currentUser;