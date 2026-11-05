import { Fragment, type ReactNode } from "react";

// Some verse/passage text in the data uses a literal "<br>" tag or a "\n"
// character to mark a paragraph break, but as plain text content neither
// renders as a line break in the browser — so both need to be normalized
// before display or copy.
function splitOnLineBreaks(text: string): string[] {
  return text.split(/<br\s*\/?>|\n/gi);
}

export function formatVerseText(
  text: string,
  highlight = "",
  highlightOccurrence = 0,
): ReactNode {
  const lines = splitOnLineBreaks(text);
  let occurrenceOffset = 0;
  return lines.map((line, index) => {
    const positions = highlight ? findMatchPositions(line, highlight) : [];
    const localOccurrence = highlightOccurrence - occurrenceOffset;
    occurrenceOffset += positions.length;
    return (
      <Fragment key={index}>
        {highlight ? highlightMatch(line, highlight, localOccurrence) : line}
        {index < lines.length - 1 && <br />}
      </Fragment>
    );
  });
}

function findMatchPositions(text: string, query: string): number[] {
  if (!query) return [];
  const lowerText = text.toLocaleLowerCase("az");
  const lowerQuery = query.toLocaleLowerCase("az");
  const positions: number[] = [];
  let fromIndex = 0;
  while (fromIndex <= lowerText.length - lowerQuery.length) {
    const index = lowerText.indexOf(lowerQuery, fromIndex);
    if (index < 0) break;
    positions.push(index);
    fromIndex = index + Math.max(1, lowerQuery.length);
  }
  return positions;
}

export function countTextOccurrences(text: string, query: string): number {
  return splitOnLineBreaks(text).reduce(
    (count, line) => count + findMatchPositions(line, query).length,
    0,
  );
}

function highlightMatch(text: string, query: string, occurrence: number): ReactNode {
  const index = findMatchPositions(text, query)[occurrence];
  if (index == null) return text;

  return (
    <>
      {text.slice(0, index)}
      <mark data-search-match className="rounded-sm bg-amber-300/70 px-0.5 text-inherit dark:bg-amber-300/35">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  );
}

export function verseTextToPlainText(text: string): string {
  return splitOnLineBreaks(text).join("\n");
}
