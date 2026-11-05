import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

interface PageHeaderProps {
  title: string;
  backHref?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, backHref, actions }: PageHeaderProps) {
  return (
    <header className="flex items-center justify-between px-5 py-5 sm:px-10 sm:py-6">
      <div className="flex items-center gap-2">
        {backHref && (
          <Link
            href={backHref}
            aria-label="Geri"
            className="flex shrink-0 items-center justify-center rounded-full text-foreground/55 transition-colors duration-300 hover:text-foreground"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-4 w-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        )}
        <h1
          className={
            backHref
              ? "text-[15px] font-medium text-foreground/90 sm:text-base"
              : "text-[15px] font-medium tracking-widest text-foreground/90 sm:text-base"
          }
        >
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        {actions}
        <ThemeToggle />
      </div>
    </header>
  );
}
