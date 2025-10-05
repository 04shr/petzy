// RightSidebar.js
import React, { useState, useRef, useEffect } from "react";
import { Mic, Send, Square } from "lucide-react";
// --- Text-to-Speech helper ---
// --- Text-to-Speech helper with mouth animation ---

const speakText = (text, petRef) => {
  if (!window.speechSynthesis) return;

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.onstart = () => {
    if (petRef.current?.startSpeaking) {
      petRef.current.startSpeaking();
    }
  };

  utterance.onend = () => {
    if (petRef.current?.stopSpeaking) {
      petRef.current.stopSpeaking();
    }
  };

  window.speechSynthesis.speak(utterance);
};

// --- Right Sidebar Component ---
export default function RightSidebar({ petRef }) {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello 👋! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) =>
      setInput(event.results[0][0].transcript);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    const botReply = input; // echo for now
    setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);

    speakText(botReply, petRef);

    setInput("");
  };

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported");
      return;
    }

    if (listening) recognitionRef.current.stop();
    else recognitionRef.current.start();

    setListening(!listening);
  };

  return (
    <aside className="w-72 bg-black bg-opacity-40 backdrop-blur-3xl border-l-2 border-white border-opacity-20 flex flex-col p-4 space-y-3 overflow-y-auto relative">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-400 via-red-400 to-pink-400 animate-pulse-slow"></div>

      {/* Header */}
      <div className="text-center p-4 border-b border-white border-opacity-20">
        <div className="font-['Orbitron'] text-white text-xl font-bold mb-1">
          🤖 Chat Assistant
        </div>
        <div className="text-white text-opacity-70 text-sm">
          Ask anything in real-time
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
              msg.sender === "user"
                ? "ml-auto bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow"
                : "mr-auto bg-white bg-opacity-10 text-white border border-white border-opacity-20"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-1 border-t border-white border-opacity-20 flex items-center gap-1">
        <button
          className={`p-1.5 rounded-full ${
            listening
              ? "bg-red-500 text-white"
              : "bg-white bg-opacity-10 text-white border border-white border-opacity-20"
          } hover:opacity-80 transition`}
          onClick={toggleMic}
        >
          {listening ? <Square size={10} /> : <Mic size={16} />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type or speak..."
          className="flex-1 px-3 py-2 rounded-xl bg-white bg-opacity-10 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-20 focus:outline-none text-sm"
        />

        <button
          className="p-1.5 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 text-white shadow hover:opacity-90 transition"
          onClick={handleSend}
        >
          <Send size={13} />
        </button>
      </div>
    </aside>
  );
}
