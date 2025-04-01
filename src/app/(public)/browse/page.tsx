import Header from "@/components/layout/Header";
import DraggableCircle from "@/components/ui/DraggableCircle";

export default function BrowsePage() {
  return (
    <>
      <Header title="검색" />
      <div className="flex h-full w-full items-center justify-center">
        <div className="grid w-full grid-cols-2 gap-4 divide-x border-y px-4 text-xl font-extrabold">
          <div className="p-4">
            <p className="mb-4 text-4xl">🎤</p>
            <p>아티스트 검색</p>
          </div>
          <div className="p-4">
            <p className="mb-4 text-4xl">🏟️</p>
            <p>공연장 시야 검색</p>
          </div>
        </div>

        <DraggableCircle text="개발중" color="bg-red-500" />
      </div>
    </>
  );
}
