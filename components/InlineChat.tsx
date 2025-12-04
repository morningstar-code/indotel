"use client";

import { useState } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface InlineChatProps {
  initialQuestion: string;
  context?: string;
}

export default function InlineChat({ initialQuestion, context }: InlineChatProps) {
  const [input, setInput] = useState(initialQuestion);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    // Limpiar el cuadro de texto inmediatamente después de enviar
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/inline-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: trimmed,
          history: messages,
          context,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data?.error || "No se pudo obtener respuesta de la IA. Verifique la configuración de la API."
        );
      }

      const data = (await response.json()) as { answer?: string };
      const answer = data.answer || "No se obtuvo respuesta.";

      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al comunicarse con el servicio de IA."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3 md:p-4 space-y-3">
      <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={
              "text-[0.8rem] leading-relaxed rounded-lg px-3 py-2 " +
              (m.role === "user"
                ? "bg-white text-slate-800 border border-slate-200"
                : "bg-emerald-50 text-emerald-900 border border-emerald-100")
            }
          >
            <span className="font-semibold">
              {m.role === "user" ? "Usted:" : "IA:"}
            </span>{" "}
            <span>{m.content}</span>
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-1">
        <textarea
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-[0.8rem] leading-relaxed text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 min-h-[144px]"
          rows={6}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={loading}
          className="w-full rounded-md bg-sky-600 px-2 py-1 text-[0.7rem] font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? "Consultando a la IA..." : "Enviar pregunta"}
        </button>
      </div>

      {error && (
        <div className="text-[0.65rem] text-rose-700 mt-1">{error}</div>
      )}
    </div>
  );
}
