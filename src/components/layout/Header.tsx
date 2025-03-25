export default function Header({ title }: { title: string }) {
  return (
    <header className="flex items-center justify-between px-3 pb-4 pt-4">
      <h1 className="text-2xl font-bold">{title}</h1>
    </header>
  );
}
