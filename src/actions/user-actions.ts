import { createServerSupabaseClient } from "@/utils/supabase/server";

// 사용자의 좋아하는 아티스트 목록을 가져오는 서버 액션
export async function getFavoriteArtists(userId: string) {
  const supabase = await createServerSupabaseClient();

  // 사용자 정보 가져오기
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("favorites")
    .eq("id", userId)
    .single();

  if (userError) {
    console.error("사용자 정보 조회 오류:", userError);
    return { error: "사용자 정보를 불러오는데 실패했습니다." };
  }

  // 좋아하는 아티스트가 없는 경우
  if (!userData?.favorites || userData.favorites.length === 0) {
    return { artists: [] };
  }

  // 아티스트 정보 가져오기
  const { data: artistsData, error: artistsError } = await supabase
    .from("artists")
    .select("*")
    .in("id", userData.favorites);

  if (artistsError) {
    console.error("아티스트 정보 조회 오류:", artistsError);
    return { error: "아티스트 정보를 불러오는데 실패했습니다." };
  }

  return { artists: artistsData || [] };
}

// 사용자 정보를 가져오는 서버 액션
export async function getUserProfile(userId: string) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("사용자 정보 조회 오류:", error);
    return { error: "사용자 정보를 불러오는데 실패했습니다." };
  }

  return { user: data };
}

// 사용자 정보와 좋아하는 아티스트를 한 번에 가져오는 서버 액션
export async function getUserProfileWithFavorites(userId: string) {
  const supabase = await createServerSupabaseClient();

  // 사용자 정보 가져오기
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (userError) {
    console.error("사용자 정보 조회 오류:", userError);
    return { error: "사용자 정보를 불러오는데 실패했습니다." };
  }

  if (!user) {
    return { error: "사용자 정보를 찾을 수 없습니다." };
  }

  // 좋아하는 아티스트가 없는 경우
  if (!user.favorites || user.favorites.length === 0) {
    return { user, favoriteArtists: [] };
  }

  // 아티스트 정보 가져오기
  const { data: artistsData, error: artistsError } = await supabase
    .from("artists")
    .select("*")
    .in("id", user.favorites);

  if (artistsError) {
    console.error("아티스트 정보 조회 오류:", artistsError);
    // 아티스트 정보 조회 실패해도 사용자 정보는 반환
    return {
      user,
      favoriteArtists: [],
      error: "아티스트 정보를 불러오는데 실패했습니다.",
    };
  }

  return { user, favoriteArtists: artistsData || [] };
}
