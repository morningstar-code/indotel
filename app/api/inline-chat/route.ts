import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = "claude-3-5-haiku-latest";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { question, history = [], context } = (await req.json()) as {
      question: string;
      history?: ChatMessage[];
      context?: string;
    };

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY no está configurada" },
        { status: 500 }
      );
    }

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Pregunta no válida" },
        { status: 400 }
      );
    }

    const messagesPayload = [
      ...history.map((m) => ({
        role: m.role,
        content: [
          {
            type: "text" as const,
            text: m.content,
          },
        ],
      })),
      {
        role: "user" as const,
        content: [
          {
            type: "text" as const,
            text:
              (context ? `${context.trim()}\n\n` : "") +
              `Pregunta del usuario: ${question.trim()}`,
          },
        ],
      },
    ];

    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY as string,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 800,
        temperature: 0.7,
        system:
          "Eres un experto en regulación de telecomunicaciones en América Latina. Respondes de forma breve, clara y enfocada a la toma de decisiones de alto nivel.",
        messages: messagesPayload,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic inline-chat error", response.status, errorText);
      return NextResponse.json(
        { error: `Anthropic inline-chat error ${response.status}: ${errorText}` },
        { status: 500 }
      );
    }

    const data = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };

    const answer = (data.content || [])
      .map((block) => (block.type === "text" && block.text ? block.text : ""))
      .join("\n")
      .trim();

    return NextResponse.json({ answer: answer || "No se pudo generar una respuesta." });
  } catch (error) {
    console.error("Inline chat API error", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al procesar la solicitud de chat",
      },
      { status: 500 }
    );
  }
}
