import Link from "next/link";

interface BookCardProps {
  title: string;
  religion: string;
  description: string;
  href: string;
}

export function BookCard({ title, religion, description, href }: BookCardProps) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-4 border-b border-border py-6 transition duration-300 ease-in-out first:pt-0 last:border-b-0 active:scale-[0.98] active:duration-100"
    >
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="text-xs font-medium tracking-widest text-muted uppercase">
          {religion}
        </span>
        <h2 className="font-serif text-2xl text-foreground sm:text-[28px]">
          {title}
        </h2>
        <p className="truncate text-sm text-muted">{description}</p>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-4 w-4 shrink-0 text-foreground/30 transition-colors duration-300 group-hover:text-foreground/60"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
