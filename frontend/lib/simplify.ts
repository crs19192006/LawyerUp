export type SimplifiedText = {
  summary: string;
  bullets: string[];
  meaning: string;
};

export function simplifyLegalText(input: string): SimplifiedText {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      summary: "Add legal text to generate a demo summary.",
      bullets: ["No text provided yet."],
      meaning: "Share the document text to see a plain-English version.",
    };
  }

  // Mocked simplification for demo: create predictable, readable output.
  const sentences = trimmed.split(".").map((sentence) => sentence.trim()).filter(Boolean);
  const summary = sentences[0] ? `${sentences[0]}.` : trimmed.slice(0, 160);

  return {
    summary,
    bullets: [
      "The document outlines the core dispute and parties involved.",
      "Key obligations and dates are listed for reference.",
      "Any relief requested is summarized for the hearing.",
    ],
    meaning:
      "This means you should focus on the main issue, keep your documents ready, and track the next scheduled hearing.",
  };
}
