import React, { useCallback, useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useParams } from "react-router";
import SendPack from "./Code Editor/SandPack";
import { useLocation } from "react-router-dom";
import Navbar from "./common/ui/Navbar";
import ChatComponent from "./ChatComponent";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { BASEURL } from "./landing/Input";

export interface MessageType {
  id: string;
  type: "USER" | "BOT";
  content: string;
}
function ConversationPage() {
  const [chat, setChat] = useState<MessageType[]>([]);
  const [componentFiles, setComponentFiles] = useState("");

  const location = useLocation();
  const initialPrompt = location.state;
  
  const { userId, isLoaded } = useAuth();
  const { conversationId } = useParams();

  const [loading, setLoading] = useState(false);

  const initialRequest = useCallback(async () => {
    try {
      setLoading(true);
      if (isLoaded) {
        setChat((prev) => [
          ...prev,
          { id: crypto.randomUUID(), type: "USER", content: initialPrompt },
        ]);
        const response = await axios.post(`${BASEURL}generate-component`, {
          userId,
          conversationId,
          prompt: initialPrompt,
        });
        const data = response.data;
        setChat((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            type: "BOT",
            content: response.data.data.message,
          },
        ]);
        setComponentFiles(response.data.data.code);
        console.log("🚀 ~ data:", data);
      }
    } catch (error) {
      console.error("🚀 ~ generateComponent ~ error:", error);

      throw error;
    } finally {
      setLoading(false);
    }
  }, [initialPrompt]);

  useEffect(() => {
    initialRequest();
  }, [initialPrompt]);

  return (
    <div>
      <Navbar />
      <div className="  text-white">
        <ResizablePanelGroup
          direction="horizontal"
          className=" bg-black !h-screen pt-[4%] "
        >
          <ResizablePanel>
            <ChatComponent  setLoading={setLoading}chat={chat} setChat={setChat} loading={loading} setComponentFiles={setComponentFiles} />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>
            <SendPack
              files={componentFiles ? JSON.parse(componentFiles) : ""}
              loading={loading}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}

export default ConversationPage;
