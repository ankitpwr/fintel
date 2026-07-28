import axios from "axios";
import { create, type StateCreator } from "zustand";
import { toast } from "@/components/ui/toast";

interface UserState {
  username: string | null;
  email: string | null;
  profilepic: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface UserAction {
  signup: (authcode: string) => void;
  signin: (authcode: string) => void;
  userDetails: () => void;
}

type UserStoreType = UserState & UserAction;

const UserStore: StateCreator<UserStoreType> = (set) => ({
  isAuthenticated: false,
  username: null,
  email: null,
  profilepic: null,
  isLoading: false,
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
        toast.add({ type: "success", description: "Error occured" });
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

  userDetails: async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/auth/me`,
      );
      set({
        username: response.data.data.username,
        email: response.data.data.email,
        profilepic: response.data.data.profilepic,
        isAuthenticated: true,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.add({ type: "success", description: error.response?.data.error });
      } else {
        console.log("Unexpected error:", error);
      }
    }
  },
});

const useUserStore = create<UserStoreType>(UserStore);
export default useUserStore;
