import Header from "@/components/layout/Header";

export default async function FeedPage() {
  return (
    <>
      <Header title="피드" />
      <div className="p-4">
        <div className="mt-4">피드 컨텐츠</div>
      </div>
    </>
  );
}
