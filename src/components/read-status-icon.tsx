interface ReadStatusIconProps {
  active: boolean;
}

// Non-interactive status indicator — read state is set automatically as the
// user reads, never by clicking this icon, so it deliberately has no
// onClick/hover affordance.
export function ReadStatusIcon({ active }: ReadStatusIconProps) {
  return (
    <span
      aria-label={active ? "Oxunub" : "Oxunmayıb"}
      className={`flex shrink-0 items-center justify-center p-1 transition-colors duration-300 ${
        active ? "text-foreground" : "text-foreground/55"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-4 w-4"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12.5l4 4L14 8" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.5l4 4L22 8" />
      </svg>
    </span>
  );
}
