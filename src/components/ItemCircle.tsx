export default function ItemCircle({
  text,
  color,
}: {
  text: string;
  color: string;
}) {
  return (
    <div
      className={`flex aspect-square size-fit items-center justify-center rounded-full border-2 p-4 bg-[${color}]`}
    >
      {text}
    </div>
  );
}
