import { Fragment, type ReactNode } from "react";

// Some verse/passage text in the data uses a literal "<br>" tag or a "\n"
// character to mark a paragraph break, but as plain text content neither
// renders as a line break in the browser — so both need to be normalized
// before display or copy.
function splitOnLineBreaks(text: string): string[] {
  return text.split(/<br\s*\/?>|\n/gi);
}

export function formatVerseText(text: string): ReactNode {
  const lines = splitOnLineBreaks(text);
  return lines.map((line, index) => (
    <Fragment key={index}>
      {line}
      {index < lines.length - 1 && <br />}
    </Fragment>
  ));
}

export function verseTextToPlainText(text: string): string {
  return splitOnLineBreaks(text).join("\n");
}
