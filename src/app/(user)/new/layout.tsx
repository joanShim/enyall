import { ReviewHeader } from "@/components/layout/ReviewHeader";

export default function ReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="mx-4">
      <ReviewHeader isSubmitting={false} />
      {children}
    </section>
  );
}
