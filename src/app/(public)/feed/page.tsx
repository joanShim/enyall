import Header from "@/components/layout/Header";
import { getReviews } from "@/actions/getReviews";
import FeedList from "./FeedList";

export default async function FeedPage() {
  const { reviews, error } = await getReviews();

  return (
    <>
      <Header title="피드" />
      <FeedList reviews={reviews || []} error={error} />
    </>
  );
}
