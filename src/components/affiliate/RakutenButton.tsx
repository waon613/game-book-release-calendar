"use client";

import { Button } from "@/components/ui/button";

interface RakutenButtonProps {
  url: string;
  label?: string;
  className?: string;
}

export function RakutenButton({
  url,
  label = "楽天で見る",
  className = "",
}: RakutenButtonProps) {
  return (
    <Button
      asChild
      className={`bg-[#BF0000] hover:bg-[#D93030] text-white font-bold ${className}`}
    >
      <a
        href={url}
        target="_blank"
        rel="nofollow sponsored noopener noreferrer"
        className="flex items-center gap-2"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 16.801l-2.208-3.56c1.06-.331 1.778-1.302 1.778-2.442 0-1.427-1.165-2.592-2.591-2.592H9.97v8.584h1.784v-3.269h2.043l2.043 3.28h2.054zM14.9 13.11h-3.147V9.62h3.147c.443 0 .808.363.808.807v1.876c0 .443-.365.808-.808.808z" />
        </svg>
        {label}
      </a>
    </Button>
  );
}
