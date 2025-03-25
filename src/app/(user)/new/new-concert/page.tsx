import NewConcertForm from "@/components/review/NewConcertForm";

export default function NewConcertPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">새 콘서트 등록</h2>
        <p className="text-sm text-muted-foreground">
          리뷰를 작성할 콘서트 정보를 등록해주세요
        </p>
      </div>

      <NewConcertForm />
    </div>
  );
}
