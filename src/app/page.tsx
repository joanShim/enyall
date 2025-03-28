import { redirect } from "next/navigation";

export default function Home() {
  redirect("/feed");
  return (
    <div>
      <h1>Home</h1>
    </div>
  );
}
