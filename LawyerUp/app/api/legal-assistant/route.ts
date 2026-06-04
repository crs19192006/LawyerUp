import { NextResponse } from "next/server";

export const runtime = "nodejs";

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o";
const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";

const stripMarkdownCodeFence = (value: string) =>
  value.replace(/```json|```/g, "").trim();

const coerceArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }
  return [];
};

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY" },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const { text, question, language } = body ?? {};

  if (!text && !question) {
    return NextResponse.json({ error: "Missing input" }, { status: 400 });
  }

  const targetLanguage = typeof language === "string" && language.length ? language : "English";

  const prompt = question
    ? `You are a legal literacy assistant. Answer the user's question in ${targetLanguage} using plain language.\n\nDocument context (if any):\n${text ?? "(no document provided)"}\n\nQuestion: ${question}\n\nReturn JSON with keys: answer.`
    : `You are a legal literacy assistant. Summarize the document in ${targetLanguage} using simple language.\n\nDocument:\n${text}\n\nReturn JSON with keys: summary (string), bullets (array of 3 short strings), meaning (string).`;

  const response = await fetch(OPENAI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 512,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: `OpenAI request failed: ${errorText}` },
      { status: 502 }
    );
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const rawText = data.choices?.[0]?.message?.content;
  if (!rawText) {
    return NextResponse.json({ error: "Empty response" }, { status: 502 });
  }

  try {
    const parsed = JSON.parse(stripMarkdownCodeFence(rawText)) as
      | { answer?: string; summary?: string; bullets?: string[]; meaning?: string }
      | Record<string, unknown>;
    if (question) {
      return NextResponse.json({ answer: String(parsed.answer ?? rawText) });
    }
    return NextResponse.json({
      summary: String(parsed.summary ?? rawText),
      bullets: coerceArray(parsed.bullets),
      meaning: String(parsed.meaning ?? ""),
    });
  } catch (error) {
    if (question) {
      return NextResponse.json({ answer: rawText });
    }
    return NextResponse.json({ summary: rawText, bullets: [], meaning: "" });
  }
}
