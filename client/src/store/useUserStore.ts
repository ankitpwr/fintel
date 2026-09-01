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
        const message =
          error.response?.data?.error ??
          error.response?.data?.message ??
          "Something went wrong";
        toast.add({ type: "error", description: message });
      } else {
        console.log("Unexpected error:", error);
        toast.add({ type: "error", description: "Something went wrong" });
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
        const message =
          error.response?.data?.error ??
          error.response?.data?.message ??
          "Something went wrong";
        toast.add({ type: "error", description: message });
      } else {
        console.log("Unexpected error:", error);
        toast.add({ type: "error", description: "Something went wrong" });
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
      const user = response.data?.data;
      if (!user) {
        throw new Error("Invalid user details response");
      }
      set({
        username: user.username ?? null,
        email: user.email ?? null,
        profilepic: user.profilepic ?? null,
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
