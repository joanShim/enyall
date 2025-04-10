import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

interface UserAvatarStore {
  avatarUrl: string | null;
  setAvatarUrl: (url: string | null) => void;
  clearAvatar: () => void;
}

const useUserAvatarStore = create<UserAvatarStore>()(
  persist(
    (set) => ({
      avatarUrl: null,
      setAvatarUrl: (url) => set({ avatarUrl: url }),
      clearAvatar: () => set({ avatarUrl: null }),
    }),
    {
      name: "user-avatar-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function useUserAvatar() {
  const { avatarUrl, setAvatarUrl } = useUserAvatarStore();

  const fetchAvatar = async () => {
    try {
      const supabase = createBrowserSupabaseClient();

      // 현재 로그인한 사용자 정보 가져오기
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAvatarUrl(null);
        return null;
      }

      // 사용자의 avatar_url만 조회
      const { data, error } = await supabase
        .from("users")
        .select("avatar_url")
        .eq("id", user.id)
        .single();

      if (error) {
        throw error;
      }

      if (data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
        return data.avatar_url;
      }

      setAvatarUrl(null);
      return null;
    } catch (error) {
      console.error("Error fetching avatar:", error);
      setAvatarUrl(null);
      return null;
    }
  };

  return {
    avatarUrl,
    setAvatarUrl,
    fetchAvatar,
    clearAvatar: useUserAvatarStore.getState().clearAvatar,
  };
}
