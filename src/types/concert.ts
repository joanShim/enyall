import { Tables } from "@/types/db";

export type Concert = Tables<"concerts"> & {
  venue?: Tables<"venues">;
  artists?: Array<{ artist: Tables<"artists"> }>;
  artists_json?: Array<{
    id?: string;
    name_official?: string;
    name_ko?: string;
    name_en?: string;
  }> | null;
  concert_date?: string | Date;
  poster_url?: string;
  title: string;
};
