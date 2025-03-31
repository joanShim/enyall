import Header from "@/components/layout/Header";

export default function BrowsePage() {
  return (
    <>
      <Header title="검색" />
      <div className="flex h-full w-full items-center justify-center">
        <div className="animate-spin-slow flex size-40 items-center justify-center rounded-[50%] bg-red-500 p-4">
          <p className="text-2xl text-white">개발중</p>
        </div>
      </div>
    </>
  );
}
