import { redirect } from "next/navigation";

export default function Home() {
  redirect("/my");
  return (
    <div>
      <h1>Home</h1>
    </div>
  );
}
