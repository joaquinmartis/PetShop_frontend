import { create } from "zustand";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;


interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    role: string;
}

interface UserStore {
    user: User;
    isLoading: boolean;
    isLoggedIn: boolean;
    isAutenticated: boolean;
    isBackoffice: boolean;
    error: string | null;

    loadUser: () => Promise<void>;
    unloadUser: () => void;
}
export const useUserStore = create<UserStore>((set, get) => ({
    user: {} as User,
    isAutenticated: false,
    isLoading: false,
    isLoggedIn: false,
    isBackoffice: false,
    error: null,

    loadUser: async () => {
        set({ isLoading: true, error: null });
        try {

            const profileRes = await fetch(`${BASE_URL}/users/profile`, {
                method: "GET",
                credentials: "include",
            });
            if (!profileRes.ok) {
                set({ isAutenticated: false });
                return;
            }

            set({ isAutenticated: true });
            const data = await profileRes.json();

            set({ user: data, isLoading: false, isLoggedIn: true, isBackoffice: data.role === "WAREHOUSE" });
        } catch (err: any) {
            set({ error: err.message, isLoading: false, isLoggedIn: false, isBackoffice: false });
        }
    },
    unloadUser: () => {
        set({ user: {} as User, isLoggedIn: false, isBackoffice: false });
    }

}));

export default useUserStore;