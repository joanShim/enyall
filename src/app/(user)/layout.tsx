import TabBar from "@/components/layout/TabBar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <TabBar />
    </>
  );
}
