import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // 1. Import persist

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    isLoggedIn: boolean;
    setTokens: (accessToken: string, refreshToken: string) => void;
    logout: () => void;
}

// 2. Wrap the create function with persist
export const useAuthStore = create(
    persist<AuthState>(
        (set) => ({
            // Initial state
            accessToken: null,
            refreshToken: null,
            isLoggedIn: false,

            // Action to set tokens
            setTokens: (accessToken, refreshToken) => {
                set({
                    accessToken,
                    refreshToken,
                    isLoggedIn: true,
                });
            },

            // Action to clear tokens
            logout: () => {
                set({
                    accessToken: null,
                    refreshToken: null,
                    isLoggedIn: false,
                });
            },
        }),
        {
            name: 'auth-storage', // 3. Give a name for the localStorage key
        }
    )
);