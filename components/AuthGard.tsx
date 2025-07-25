// components/AuthGuard.tsx
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname, useNavigation } from 'expo-router';

// List of public routes that don't require authentication
const publicRoutes = ['/login', '/sign-nup', '/forgotPassword', '/change-password'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const navigation = useNavigation();

    // Fix: Only attempt to navigate after navigation is ready
    useEffect(() => {
        // Important: Only run navigation after the component is mounted
        if (!navigation.isReady()) {
            return;
        }

        // Don't redirect on public routes
        if (publicRoutes.includes(pathname)) {
            return;
        }

        // Redirect to login if not loading and no user
        if (!isLoading && !user) {
            setTimeout(() => {
                router.replace('/login');
            }, 0);
        }
    }, [user, isLoading, pathname, navigation.isReady()]);

    // Don't render anything on public routes
    if (publicRoutes.includes(pathname)) {
        return <>{children}</>;
    }

    // Show loading screen while checking auth
    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-900">
                <ActivityIndicator size="large" color="#F97316" />
            </View>
        );
    }

    // If on a protected route and not authenticated, render nothing (will redirect in useEffect)
    if (!user && !publicRoutes.includes(pathname)) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-900">
                <ActivityIndicator size="large" color="#F97316" />
            </View>
        );
    }

    // User is authenticated or on public route, render children
    return <>{children}</>;
}