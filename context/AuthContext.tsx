// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
    subscribeToAuthChanges,
    getCurrentUser,
    getUserProfileFromFirestore,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    sendResetPasswordEmail,
    UserProfile
} from '@/utils/auth';

// Define the context type
type AuthContextType = {
    user: User | null;
    userProfile: UserProfile | null;
    isLoading: boolean;
    signInWithEmailPassword: (email: string, password: string) => Promise<{success: boolean; error: Error | null}>;
    signUpWithEmailPassword: (email: string, password: string, displayName: string) => Promise<{success: boolean; error: Error | null}>;
    resetPassword: (email: string) => Promise<{success: boolean; error: Error | null}>;
    logout: () => Promise<boolean>;
    error: Error | null;
    refreshUserProfile: () => Promise<void>;
};

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Load user from AsyncStorage on mount
    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedUser = await getCurrentUser();
                if (storedUser) {
                    setUser(storedUser as User);
                }
            } catch (e) {
                console.error('Error loading user from storage:', e);
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    // Subscribe to auth state changes
    useEffect(() => {
        const unsubscribe = subscribeToAuthChanges(setUser, setIsLoading);
        return unsubscribe;
    }, []);

    // Load user profile when user changes
    useEffect(() => {
        const loadUserProfile = async () => {
            if (user?.uid) {
                try {
                    const profile = await getUserProfileFromFirestore(user.uid);
                    setUserProfile(profile);
                } catch (e) {
                    console.error('Error loading user profile:', e);
                }
            } else {
                setUserProfile(null);
            }
        };

        loadUserProfile();
    }, [user]);

    // Refresh user profile
    const refreshUserProfile = async () => {
        if (user?.uid) {
            const profile = await getUserProfileFromFirestore(user.uid);
            setUserProfile(profile);
        }
    };

    // Sign in with email and password
    const signInWithEmailPassword = async (email: string, password: string) => {
        setError(null);
        try {
            const result = await signInWithEmail(email, password);
            if (result.error) {
                setError(result.error);
                return { success: false, error: result.error };
            }
            return { success: true, error: null };
        } catch (e) {
            const err = e as Error;
            setError(err);
            return { success: false, error: err };
        }
    };

    // Sign up with email and password
    const signUpWithEmailPassword = async (email: string, password: string, displayName: string) => {
        setError(null);
        try {
            const result = await signUpWithEmail(email, password, displayName);
            if (result.error) {
                setError(result.error);
                return { success: false, error: result.error };
            }
            return { success: true, error: null };
        } catch (e) {
            const err = e as Error;
            setError(err);
            return { success: false, error: err };
        }
    };

    // Reset password
    const resetPassword = async (email: string) => {
        setError(null);
        try {
            const success = await sendResetPasswordEmail(email);
            return { success, error: null };
        } catch (e) {
            const err = e as Error;
            setError(err);
            return { success: false, error: err };
        }
    };

    // Logout
    const logout = async () => {
        setError(null);
        try {
            const success = await signOut();
            return success;
        } catch (e) {
            const err = e as Error;
            setError(err);
            return false;
        }
    };

    // Create value object
    const value: AuthContextType = {
        user,
        userProfile,
        isLoading,
        signInWithEmailPassword,
        signUpWithEmailPassword,
        resetPassword,
        logout,
        error,
        refreshUserProfile
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create a hook to use the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;