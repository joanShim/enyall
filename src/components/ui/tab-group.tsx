import { cn } from "@/lib/utils";

interface TabGroupProps {
  tabs: string[];
  selectedTab: string;
  onChange: (tab: string) => void;
  className?: string;
}

export function TabGroup({
  tabs,
  selectedTab,
  onChange,
  className,
}: TabGroupProps) {
  return (
    <div className={cn("flex w-full", className)}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={cn(
            "flex-1 px-4 py-2 text-sm font-medium transition-colors",
            "hover:text-gray-900",
            selectedTab === tab
              ? "border-b-2 border-black text-gray-900"
              : "text-gray-500",
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
