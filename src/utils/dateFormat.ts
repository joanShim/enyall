export function formatDate(dateString: string | null): string {
  if (!dateString) return "날짜 없음";

  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
