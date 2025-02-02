import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useCallback, useEffect, useState } from "react";
import { MessageType } from "./conversationPage";
import { redirect, useNavigate, useParams } from "react-router";
import { RedirectToSignIn, SignedOut, useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { BASEURL } from "./landing/Input";
function ChatComponent({
  chat,
  setChat,
  
  loading,
  setLoading,
  setComponentFiles,
}: {
  chat: MessageType[];
  setChat: any;
  loading: boolean;
 
  setLoading: any;
  setComponentFiles: any;
}) {
  const [input, setInput] = useState("");
  const { conversationId } = useParams();
  const { userId, isLoaded } = useAuth();
   const availableCredit = localStorage.getItem('user-credit')
  const handleSendMessage = useCallback(async () => {
    if (isLoaded) {
      if (input.trim() === "") return;
      setLoading(true);

      // check credit
      if (Number(availableCredit) < 4) {
        return alert("Insufficient credits");
      }

      const newMessage = {
        id: crypto.randomUUID(),
        type: "USER",
        content: input,
      };
      setChat([...chat, newMessage]);
      // send prompt
      const response = await axios.post(`${BASEURL}generate-component`, {
        userId,
        conversationId,
        prompt: newMessage.content,
      });
      //get code and update the file and chat
      setComponentFiles(response.data.data.code);
      setChat([
        ...chat,
        newMessage,
        {
          id: crypto.randomUUID(),
          type: "BOT",
          content: response.data.data.message,
        },
      ]);
      setInput("");


      const getCredit = await axios.get(`${BASEURL}get-user-credit/${userId}`);
      localStorage.setItem("user-credit",getCredit.data.data.toString());

      setLoading(false);
    }
  }, [input, userId]);

  return (
    <div className="h-screen flex flex-col">
      {/* Chat messages container */}
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <div className=" h-[81%] overflow-y-auto  no-scrollbar bg-black p-4 space-y-4">
        {chat.map((message: MessageType) => (
          <div
            key={message.id}
            className={`flex items-center gap-4 ${
              message.type === "BOT" ? "justify-start" : "justify-end"
            }`}
          >
            {message.type === "BOT" && (
              <Avatar>
                <AvatarImage src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxJzgfpElTJzsWKt7SptDAp2y00a81_PGVsA&s" />
              </Avatar>
            )}
            <div
              className={`p-3 rounded-lg text-white ${
                message.type === "BOT" ? "bg-blue-500" : "bg-green-500"
              }`}
            >
              {message.content}
            </div>
            {message.type === "USER" && (
              <Avatar>
                <AvatarImage src="https://ghavatars.staticblitz.com/bikaxh01.png" />
              </Avatar>
            )}
          </div>
        ))}
        {loading && (
          <div className=" flex  gap-2 items-center">
            <Avatar>
              <AvatarImage src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxJzgfpElTJzsWKt7SptDAp2y00a81_PGVsA&s" />
            </Avatar>
            <span>Generating...</span>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="bg-black border-t-2 border-gray-400 rounded-2xl p-4 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
          className="flex-grow p-2 border bg-gray-800 border-gray-400 rounded-lg"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSendMessage}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatComponent;
