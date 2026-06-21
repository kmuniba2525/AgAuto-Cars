import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
const AIChat = ({ products, sampleQuestions }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = async (customText) => {
  const textToSend = customText || message;

  if (!textToSend.trim()) return;

  // clear input immediately
  if (!customText) {
    setMessage("");
  }

  // user message
  const userMsg = {
    type: "user",
    text: textToSend,
  };

  // update UI immediately
  setMessages((prev) => [...prev, userMsg]);

  try {

    // history for AI memory
    const history = [...messages, userMsg].map((msg) => ({
      role: msg.type === "user" ? "user" : "assistant",
      content: msg.text,
    }));

    const res = await axios.post("/api/ai/ask", {
      message: textToSend,
      products,
      history,
    });

    const botMsg = {
      type: "bot",
      text: res.data.reply,
    };

    setMessages((prev) => [...prev, botMsg]);

  } catch (err) {
    console.log(err);

    setMessages((prev) => [
      ...prev,
      {
        type: "bot",
        text: "Something went wrong. Please try again.",
      },
    ]);
  }
};

  return (
    <div className="flex flex-col h-full">

      {/* Sample Questions */}
      {messages.length === 0 && (
        <div className="p-3 flex flex-wrap gap-2">
          {sampleQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              className="text-xs px-3 py-2 bg-white border rounded-full shadow hover:bg-indigo-100 transition"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">

        {messages.map((msg, i) => (
          <div key={i}>

            {/* USER */}
            {msg.type === "user" ? (
              <div className="text-right">
                <span className="bg-green-600 text-white px-3 py-1 rounded">
                  {msg.text}
                </span>
              </div>
            ) : (
              /* BOT */
              <div className="bg-gray-100 p-3 rounded-xl text-sm text-gray-700 leading-7">


<ReactMarkdown
  rehypePlugins={[rehypeRaw]}
  components={{
    p: ({ children }) => <p className="mb-2">{children}</p>,
    li: ({ children }) => <li className="ml-5 list-disc mb-1">{children}</li>,
    strong: ({ children }) => <strong className="font-semibold text-black">{children}</strong>,
  }}
>
  {msg.text || ""}
</ReactMarkdown>

</div>
            )}

          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 p-2 border-t">
       <input
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  }}
  className="flex-1 border p-2 rounded"
  placeholder="Ask something..."
/>

        <button
          onClick={() => sendMessage()}
          className="bg-green-600 text-white px-3 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AIChat;