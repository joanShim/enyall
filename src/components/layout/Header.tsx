export default function Header({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-white px-3 pb-4 pt-4">
      <h1 className="text-2xl font-bold">{title}</h1>
    </header>
  );
}
