import RandomEyeLoader from "@/components/ui/RandomEyeLoader";

export default function loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <RandomEyeLoader />
    </div>
  );
}
