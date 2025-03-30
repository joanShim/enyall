import { CreateReviewHeader } from "@/components/layout/CreateReviewHeader";

export default function ReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="mx-4">
      <CreateReviewHeader isSubmitting={false} />
      {children}
    </section>
  );
}
