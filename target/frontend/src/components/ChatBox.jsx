import React, { useState } from "react";
import { sendChatMessage } from "../api/api";

export default function ChatBox({ user, userProfile }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setMessages([...messages, { role: "user", text: msg }]);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await sendChatMessage(msg);
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((m) => [...m, { role: "assistant", text: "Error fetching reply" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-large h-[600px] flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/20">
        <h2 className="text-lg font-semibold text-gray-100">
          💬 Chat with your AI Financial Assistant
        </h2>
        <p className="text-sm text-gray-300">
          Ask questions about your finances, get spending insights, or request budget advice
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 && (
          <div className="text-center text-gray-300 py-8">
            <p className="text-lg text-gray-100">👋 Hi {userProfile?.profile?.full_name || userProfile?.profile?.username || 'there'}!</p>
            <p className="mt-2 text-gray-300">Ask me anything about your finances...</p>
            <div className="mt-4 text-sm text-gray-400">
              <p className="text-gray-200">💡 Try asking:</p>
              <p className="text-gray-400">"How much did I spend this month?"</p>
              <p className="text-gray-400">"What are my biggest expenses?"</p>
              <p className="text-gray-400">"Help me create a budget"</p>
            </div>
          </div>
        )}
        
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl shadow-sm ${
              m.role === "user" 
                ? "bg-indigo-600 text-white" 
                : "bg-gray-800/80 text-gray-100 border border-gray-700"
            }`}>
              <p className="text-sm">{m.text}</p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800/80 text-gray-100 px-4 py-2 rounded-xl shadow-sm border border-gray-700">
              <p className="text-sm animate-pulse">🤖 Thinking...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/20">
        <div className="flex space-x-2">
          <input
            className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 backdrop-blur-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your finances..."
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-primary-gradient text-white rounded-xl shadow-glow hover:scale-105 hover:shadow-glow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}