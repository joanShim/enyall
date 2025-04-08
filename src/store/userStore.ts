import { create } from "zustand";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { Tables } from "@/types/db";
import { toast } from "sonner";

interface UserState {
  userProfile: Tables<"users"> | null;
  isLoading: boolean;
  error: string | null;
  fetchUserProfile: () => Promise<void>;
  clearUserProfile: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  userProfile: null,
  isLoading: false,
  error: null,

  fetchUserProfile: async () => {
    const supabase = createBrowserSupabaseClient();
    set({ isLoading: true, error: null });

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        set({ userProfile: null, isLoading: false });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      set({ userProfile: profile, isLoading: false });
    } catch (error) {
      set({
        error: "사용자 정보를 불러오는데 실패했습니다",
        isLoading: false,
      });

      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  },

  clearUserProfile: () => {
    set({ userProfile: null, error: null });
  },
}));
