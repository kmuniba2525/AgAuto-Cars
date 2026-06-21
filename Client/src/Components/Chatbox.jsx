import React from "react";
import AIChat from "./AIChat";
// import { X } from "lucide-react";

const Chatbot = ({ isOpen, onClose, products }) => {
  if (!isOpen) return null;


  const sampleQuestions = [
  "Show me fresh fruits",
  "Any discounts today?",
  "Find dairy products",
  "Best selling items",
];
  return (
    <div className="fixed bottom-6 right-6 w-[350px] h-[500px] backdrop-blur-xl bg-white/80 border border-gray-200 shadow-2xl rounded-2xl z-50 flex flex-col overflow-hidden">

      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            🤖
          </div>
          <h3 className="text-sm font-semibold tracking-wide">
            AI Assistant
          </h3>
        </div>

        <button
  onClick={onClose}
  className="p-1 rounded-full hover:bg-white/20 transition"
>
  ✖
</button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-3 py-2">
        <AIChat products={products} sampleQuestions={sampleQuestions} />
      </div>

      {/* Footer (optional input styling placeholder) */}
      <div className="p-2 bg-white border-t">
        <div className="text-xs text-gray-400 text-center">
          Powered by AI ✨
        </div>
      </div>
    </div>
  );
};

export default Chatbot;