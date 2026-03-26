import { cn } from "@/lib/utils";

function CoalIcon({ size = 32, className }: { size?: number; className?: string }) {
  const s = size;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Top lit face — brightest, catches the light */}
      <path
        d="M8 15 L18 3 L28 15 L18 18 Z"
        fill="#504b46"
      />
      {/* Left face — mid tone */}
      <path
        d="M3 32 L8 15 L18 18 L13 34 Z"
        fill="#39342f"
      />
      {/* Right face — darkest, in shadow */}
      <path
        d="M33 32 L28 15 L18 18 L23 34 Z"
        fill="#191512"
      />
      {/* Bottom base — ground shadow */}
      <path
        d="M13 34 L18 18 L23 34 Z"
        fill="#100e0b"
      />
      {/* Peak glint — sharp highlight at the tip */}
      <path
        d="M15 7 L18 3 L21 7 L18 9 Z"
        fill="#908b85"
        opacity="0.85"
      />
      {/* Sub-facet on top face — adds depth */}
      <path
        d="M12 15 L18 9 L24 15 L18 17 Z"
        fill="#272320"
        opacity="0.5"
      />
    </svg>
  );
}

export function Logo({ small, className }: { small?: boolean; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 font-bold tracking-tight select-none",
        small ? "text-[24px]" : "text-5xl",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center bg-[#111116] border border-zinc-800/60 shadow-[0_0_18px_rgba(220,38,38,0.12)]",
          small ? "w-[38px] h-[38px] rounded-lg" : "w-[60px] h-[60px] rounded-xl"
        )}
      >
        <CoalIcon size={small ? 34 : 56} />
      </div>
      <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700 }} className="text-foreground tracking-widest uppercase">
        Cole
      </span>
    </div>
  );
}
