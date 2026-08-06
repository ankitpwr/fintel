import axios from "axios";
import { create, type StateCreator } from "zustand";
import { toast } from "@/components/ui/toast";

interface UserState {
  username: string | null;
  email: string | null;
  profilepic: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCheckedAuth: boolean;
}

interface UserAction {
  signup: (authcode: string) => void;
  signin: (authcode: string) => void;
  userDetails: () => void;
  logout: () => void;
}

type UserStoreType = UserState & UserAction;

const UserStore: StateCreator<UserStoreType> = (set) => ({
  isAuthenticated: false,
  username: null,
  email: null,
  profilepic: null,
  isLoading: false,
  hasCheckedAuth: false,
  signup: async (authcode: string) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/auth/signup`,
        {
          authCode: authcode,
        },
        { withCredentials: true },
      );
      set({
        username: response.data.data.username,
        email: response.data.data.email,
        profilepic: response.data.data.profilepic,
        isAuthenticated: true,
      });
      toast.add({ type: "success", description: "sign up successful" });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.add({ type: "success", description: error.response?.data.error });
      } else {
        console.log("Unexpected error:", error);
        toast.add({ type: "error", description: "Error occured" });
      }
    }
  },

  signin: async (authcode: string) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/auth/login`,
        {
          authCode: authcode,
        },
        { withCredentials: true },
      );
      set({
        username: response.data.data.username,
        email: response.data.data.email,
        profilepic: response.data.data.profilepic,
        isAuthenticated: true,
      });
      toast.add({ type: "success", description: "sign in successful" });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.add({ type: "success", description: error.response?.data.error });
      } else {
        console.log("Unexpected error:", error);
      }
    }
  },

  logout: async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/auth/logout`,
        {},
        { withCredentials: true },
      );
    } catch (error) {
      console.log("logout error", error);
    } finally {
      set({
        isAuthenticated: false,
        username: null,
        email: null,
        profilepic: null,
      });
      toast.add({ type: "success", description: "Logged out" });
    }
  },

  userDetails: async () => {
    try {
      set({ isLoading: true });
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/auth/me`,
        { withCredentials: true },
      );
      set({
        username: response.data.data.username,
        email: response.data.data.email,
        profilepic: response.data.data.profilepic,
        isAuthenticated: true,
        hasCheckedAuth: true,
      });
    } catch (error) {
      set({ isAuthenticated: false, hasCheckedAuth: true });
      console.log("Unexpected error:", error);
    } finally {
      set({ isLoading: false });
    }
  },
});

const useUserStore = create<UserStoreType>(UserStore);
export default useUserStore;
