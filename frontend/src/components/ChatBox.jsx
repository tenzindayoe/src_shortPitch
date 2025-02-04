import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import typingAnimation from "../assets/typing.json"; // ✅ Typing animation
import { Send } from "lucide-react";

const ChatBox = ({ sessionId, gameId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatContainerRef = useRef(null);

  // Full API URL for queries
  const API_URL = "http://shortpitchserver.com/AIChat";

  // Scroll to the bottom when a new message arrives
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  // Send user message to the backend API
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };

    // 🔥 **Clear input immediately** before API request
    setMessages((prev) => [...prev, userMsg]);
    setInput(""); // **✅ Clears instantly**
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          game_id: gameId,
          query: input,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.statusText}`);
      }

      const data = await res.json();

      const modelMsg = {
        role: "model",
        text: data.response,
        sources: data.sources ?? [], // ✅ Ensures sources is always an array
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err) {
      console.error(err);
      setError("Error fetching response.");
    } finally {
      setLoading(false);
    }
  };

  // Send on Enter (without Shift)
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full h-full bg-gray-900 p-4 rounded-2xl flex flex-col space-y-3 relative shadow-lg border border-gray-700">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <h2 className="text-lg font-bold text-white">💬 Chat with Gemini</h2>
      </div>

      {/* Chat Messages - Fixed Height and Overflow Scrolling */}
      <motion.div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-2 space-y-3 bg-gray-800 rounded-xl scrollbar-hide"
        style={{ maxHeight: "300px", scrollbarWidth: "none", msOverflowStyle: "none" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center">No messages yet. Start chatting!</p>
        ) : (
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: msg.role === "user" ? -20 : 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-lg p-3 shadow-md border border-gray-700 max-w-[80%] ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white self-end"
                      : "bg-gray-700 text-white self-start"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>

                  {/* 🔹 Render Source Buttons Below AI Responses */}
                  {msg.role === "model" && msg.sources.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {msg.sources.map((source, i) => (
                        <a
                          key={i}
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center border border-gray-300 rounded-full px-4 py-1 text-sm text-gray-200 bg-gray-700 hover:bg-gray-600 transition"
                        >
                          {source.title || "Source"}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Lottie Typing Animation (Spawns Where Next Message Would Be) */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex justify-start"
              >
                <div className="p-2 bg-gray-700 rounded-lg shadow-md border border-gray-600">
                  <Lottie animationData={typingAnimation} loop className="w-16 h-10" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Input Box */}
      <div className="flex space-x-2 relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 p-3 bg-gray-700 text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSend}
          className="bg-blue-500 p-2 rounded-lg text-white shadow-md hover:bg-blue-600 flex items-center"
        >
          <Send size={24} />
        </motion.button>
      </div>
    </div>
  );
};

export default ChatBox;
