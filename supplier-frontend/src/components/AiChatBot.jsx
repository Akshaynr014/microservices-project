import { useEffect, useRef, useState } from "react";
import { Bot, ChevronDown, MessageCircle, Send, Sparkles, X } from "lucide-react";
import API from "../services/api";

const QUICK_PROMPTS = [
  "Help me find electronics",
  "Track my latest order",
  "Show payment help",
];

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function getLocalFallbackReply(message, user) {
  const lower = message.trim().toLowerCase();

  if (lower === "hi" || lower === "hello" || lower === "hey") {
    return "Hi! I can help with products, orders, payments, and shopping questions.";
  }

  if (lower.includes("what is my name") || lower.includes("do you know my name")) {
    return user?.name
      ? `Your name is ${user.name}.`
      : 'I do not know your name yet. You can tell me by saying, "my name is Akshay".';
  }

  if (
    lower.includes("electronics") ||
    lower.includes("product") ||
    lower.includes("phone") ||
    lower.includes("laptop")
  ) {
    return "I cannot reach the assistant service right now, but you can open Products and choose the Electronics category. Please restart the AI assistant service if you want AI recommendations.";
  }

  return "I cannot reach the assistant service right now. Please make sure the API gateway and AI assistant service are running, then try again.";
}

async function getDirectSupportReply(message, user) {
  const lower = message.trim().toLowerCase();

  if (lower === "hi" || lower === "hello" || lower === "hey") {
    return "Hi! I can help with products, orders, payments, and shopping questions.";
  }

  if (lower.includes("payment help") || lower.includes("payments") || lower.includes("payment")) {
    return "Payment help: open Payments from the dashboard to view your transaction history. During checkout, complete the Razorpay payment window and wait for the success confirmation before closing it.";
  }

  if (lower.includes("track") && lower.includes("order")) {
    if (!user?.id) {
      return "Please log in first so I can check your latest order.";
    }

    try {
      const response = await API.get(`/orders/user/${user.id}`);
      const orders = Array.isArray(response.data) ? response.data : [];

      if (orders.length === 0) {
        return "You do not have any orders yet. Open Products, add an item, and place your first order.";
      }

      const latestOrder = [...orders].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA || (b.id || 0) - (a.id || 0);
      })[0];

      return `Your latest order is #${latestOrder.id}. Status: ${latestOrder.status || "PENDING"}. Total: Rs ${latestOrder.totalAmount ?? "N/A"}.`;
    } catch {
      return "I could not load your orders right now. Please make sure the order service and API gateway are running, then try again.";
    }
  }

  return null;
}

function AiChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ASSISTANT",
      text: "Hi! I am your MicroShop assistant. Ask me about products, orders, payments, or shopping help.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const user = getCurrentUser();
  const userId = user?.id || 1;

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  const sendMessage = async (messageText = input) => {
    const trimmed = messageText.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "USER", text: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const directReply = await getDirectSupportReply(trimmed, user);
      if (directReply) {
        setMessages((prev) => [...prev, { role: "ASSISTANT", text: directReply }]);
        return;
      }

      const response = await fetch("http://localhost:8070/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          message: trimmed,
        }),
      });

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const data = await response.json();
      const reply = data.reply || "I am here to help. Could you share a little more detail?";
      setMessages((prev) => [
        ...prev,
        { role: "ASSISTANT", text: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "ASSISTANT",
          text: getLocalFallbackReply(trimmed, user),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-2xl shadow-slate-900/25 transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
        aria-label="Open MicroShop assistant"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500">
          <MessageCircle size={20} />
        </span>
        <span className="hidden sm:block">Need help?</span>
      </button>
    );
  }

  return (
    <section className="fixed bottom-4 right-4 z-50 flex h-[min(640px,calc(100vh-2rem))] w-[calc(100vw-2rem)] max-w-[420px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 sm:bottom-5 sm:right-5">
      <header className="bg-slate-950 px-4 py-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500">
              <Bot size={23} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold">MicroShop Assistant</h2>
                <Sparkles size={15} className="text-yellow-300" />
              </div>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Online support for shopping questions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Minimize assistant"
            >
              <ChevronDown size={18} />
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Close assistant"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Quick questions</p>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendMessage(prompt)}
              disabled={loading}
              className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto bg-white px-4 py-5">
        {messages.map((msg, index) => {
          const isUser = msg.role === "USER";
          return (
            <div key={`${msg.role}-${index}`} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div className={`flex max-w-[86%] gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                <div
                  className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isUser ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {isUser ? (user?.name?.[0] || "U").toUpperCase() : <Bot size={16} />}
                </div>
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? "rounded-tr-sm bg-blue-600 text-white"
                      : "rounded-tl-sm border border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
              <Bot size={16} />
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-2">Assistant is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        className="border-t border-slate-200 bg-white p-3"
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage();
        }}
      >
        <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
          <textarea
            className="max-h-28 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
            placeholder="Type your question..."
            value={input}
            rows={1}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
              }
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </section>
  );
}

export default AiChatBot;
