"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
  });

  useEffect(() => {
    const supabase = createClient();

    // 초기 세션 확인 (getSession 사용 - 클라이언트에서는 안전함)
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setAuthState({
          user: session?.user ?? null,
          session,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error getting initial session:", error);
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
        });
      }
    };

    getInitialSession();

    // 인증 상태 변경 구독
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        isLoading: false,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return authState;
}
