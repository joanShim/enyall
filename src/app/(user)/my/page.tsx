import CreateReviewButton from "./CreateReviewButton";
import MyReviewList from "./MyReviewList";
import { MyProfileSection } from "./MyProfileSection";
import ProfileHeader from "./ProfileHeader";

export default async function MyPage() {
  return (
    <>
      <ProfileHeader />
      <MyProfileSection />
      <MyReviewList />
      <CreateReviewButton />
    </>
  );
}
