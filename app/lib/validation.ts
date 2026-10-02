export class ValidationError extends Error {}

export function validationResult(error: unknown) {
  if (error instanceof ValidationError) return { error: error.message };
  throw error;
}

export function pageNumber(value: unknown): number {
  const page = typeof value === "string" ? Number(value) : NaN;
  return Number.isSafeInteger(page) && page > 0 && page <= 100000 ? page : 1;
}

export function formText(form: FormData, key: string, max: number): string {
  const value = form.get(key);
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) {
    throw new ValidationError(`Invalid ${key}`);
  }
  return value.trim();
}

export function validName(value: string): boolean {
  return /^[a-zA-Z0-9_-]{2,21}$/.test(value);
}

export function validImage(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "utfs.io" &&
      !url.username &&
      !url.password &&
      url.pathname.startsWith("/f/")
    );
  } catch {
    return false;
  }
}

export function validRichText(value: unknown, depth = 0): boolean {
  if (!value || typeof value !== "object" || depth > 20) return false;
  const node = value as {
    type?: unknown;
    text?: unknown;
    content?: unknown;
    marks?: unknown;
  };
  if (
    typeof node.type !== "string" ||
    ![
      "doc",
      "paragraph",
      "text",
      "heading",
      "bulletList",
      "orderedList",
      "listItem",
      "blockquote",
      "codeBlock",
      "hardBreak",
      "horizontalRule",
    ].includes(node.type)
  )
    return false;
  if (node.type === "text" && typeof node.text !== "string") return false;
  if (
    node.marks !== undefined &&
    (!Array.isArray(node.marks) ||
      !node.marks.every(
        (mark) =>
          mark && ["bold", "italic", "strike", "code"].includes(mark.type),
      ))
  )
    return false;
  return (
    node.content === undefined ||
    (Array.isArray(node.content) &&
      node.content.every((child) => validRichText(child, depth + 1)))
  );
}

export function postBody(json: unknown) {
  if (json == null) return { textContent: undefined, bodyText: "" };
  if (
    !validRichText(json) ||
    (json as { type: string }).type !== "doc" ||
    JSON.stringify(json).length > 50000
  )
    throw new ValidationError("Invalid or oversized post body");
  const text = (node: any): string =>
    node.type === "text" ? node.text : (node.content ?? []).map(text).join(" ");
  // Store only editor fields we use; arbitrary attributes never enter persistence.
  const clean = (
    node: any,
  ): import("@prisma/client").Prisma.InputJsonObject => ({
    type: node.type,
    ...(node.type === "text" ? { text: node.text } : {}),
    ...(node.content ? { content: node.content.map(clean) } : {}),
    ...(node.marks
      ? { marks: node.marks.map((mark: any) => ({ type: mark.type })) }
      : {}),
    ...(node.type === "heading"
      ? {
          attrs: {
            level: [1, 2, 3, 4, 5, 6].includes(node.attrs?.level)
              ? node.attrs.level
              : 2,
          },
        }
      : {}),
  });
  return {
    textContent: clean(json),
    bodyText: text(json),
  };
}
