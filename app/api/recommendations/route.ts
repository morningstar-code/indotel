import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = "claude-3-5-haiku-latest";

export async function POST(req: NextRequest) {
  try {
    const { countryA, countryB, category, practiceA, practiceB } =
      await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY no está configurada" },
        { status: 500 }
      );
    }

    const prompt = `
Eres un experto en regulación de telecomunicaciones en América Latina.
Analiza la siguiente información sobre mejores prácticas regulatorias.

País A: ${countryA}
Categoría: ${category}
Prácticas actuales:
${practiceA.details}

País B (referencia): ${countryB}
Prácticas actuales:
${practiceB.details}

Por favor proporciona:

1. Un resumen breve de las principales brechas de País A frente a País B.

2. Entre 3 y 5 acciones regulatorias concretas que podría implementar País A para mejorar sus prácticas en esta categoría.

3. Clasifica cada acción en: corto plazo (menos de 1 año), mediano plazo (1-3 años) o largo plazo (más de 3 años).

4. Menciona buenas prácticas de otros países similares que podrían ser relevantes.

Responde en un lenguaje técnico pero claro, en español. Usa formato de lista con viñetas para las acciones.
`;

    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY as string,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1000,
        temperature: 0.7,
        system:
          "Eres un experto en regulación de telecomunicaciones en América Latina. Proporcionas recomendaciones técnicas y prácticas basadas en análisis comparativo de marcos regulatorios.",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error", response.status, errorText);
      return NextResponse.json(
        {
          error: `Anthropic API error ${response.status}: ${errorText}`,
        },
        { status: 500 }
      );
    }

    const data = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };

    const textContent = (data.content || [])
      .map((block) => (block.type === "text" && block.text ? block.text : ""))
      .join("\n")
      .trim();

    const recommendations =
      textContent || "No se pudieron generar recomendaciones.";

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al generar recomendaciones",
      },
      { status: 500 }
    );
  }
}



