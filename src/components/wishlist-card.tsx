import { WishlistToggleButton } from "@/components/wishlist-toggle-button";
import { CopyVerseButton } from "@/components/copy-verse-button";
import { formatVerseText, verseTextToPlainText } from "@/lib/format-verse-text";
import type { WishlistItem } from "@/lib/wishlist";

interface WishlistCardProps {
  item: WishlistItem;
  onRemove: (id: string) => void;
}

export function WishlistCard({ item, onRemove }: WishlistCardProps) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-border p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-xs font-medium tracking-widest text-muted uppercase">
          {item.bookName}
        </span>
        <div className="-mr-1 flex shrink-0 items-center gap-4">
          <WishlistToggleButton active onClick={() => onRemove(item.id)} />
          <CopyVerseButton
            text={`${item.bookName}\n${item.chapterName}\n${verseTextToPlainText(item.verseText)}`}
          />
        </div>
      </div>
      <h2 className="font-serif text-base text-foreground sm:text-lg">{item.chapterName}</h2>
      <p className="text-sm leading-relaxed text-muted">{formatVerseText(item.verseText)}</p>
    </div>
  );
}
