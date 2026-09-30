import { createElement, Fragment, ReactNode } from "react";
import type { JSONContent } from "@tiptap/react";
import { validRichText } from "../lib/validation";

function renderNode(node: JSONContent, key: number, depth = 0): ReactNode {
  if (!node || depth > 20) return null;
  if (node.type === "text") {
    let text: ReactNode = typeof node.text === "string" ? node.text : "";
    for (const mark of Array.isArray(node.marks) ? node.marks : []) {
      const tags: Record<string, string> = {
        bold: "strong",
        italic: "em",
        strike: "s",
        code: "code",
      };
      if (mark && Object.hasOwn(tags, mark.type))
        text = createElement(tags[mark.type], null, text);
    }
    return <Fragment key={key}>{text}</Fragment>;
  }
  const children = Array.isArray(node.content)
    ? node.content.map((child, index) => renderNode(child, index, depth + 1))
    : null;
  const tags: Record<string, string> = {
    paragraph: "p",
    bulletList: "ul",
    orderedList: "ol",
    listItem: "li",
    blockquote: "blockquote",
    codeBlock: "pre",
    hardBreak: "br",
    horizontalRule: "hr",
  };
  const level = Number(node.attrs?.level);
  const tag =
    node.type === "heading"
      ? `h${[1, 2, 3, 4, 5, 6].includes(level) ? level : 2}`
      : Object.hasOwn(tags, node.type ?? "")
        ? tags[node.type!]
        : undefined;
  // Stored attributes are never spread into the DOM.
  return tag ? (
    createElement(tag, { key }, children)
  ) : (
    <Fragment key={key}>{children}</Fragment>
  );
}

export function RenderToJson({ data }: { data: unknown }) {
  if (!validRichText(data)) return null;
  return (
    <div className="px-2 pt-2 prose dark:prose-invert break-words">
      {renderNode(data as JSONContent, 0)}
    </div>
  );
}
