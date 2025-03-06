import { ChangeEvent, useState } from "react";
import { PlaceholdersAndVanishInput } from "../common/ui/Vanish-Input";
import { Navigate, redirect, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { toast } from "sonner";
export const BASEURL = import.meta.env.VITE_SERVER_BASE_URL;
const placeholders = [
  "Design a responsive navbar with dropdown menus",
  "How to create a sidebar with collapsible sections?",
  "Build an input field with real-time validation",
  "Generate a card component with an image and text",
  "Customize a button with hover effects",
  "Create a modal with a close button and animations",
  "Design a multi-step form with progress indicators",
  "How to build a sticky header with a search bar?",
  "Generate a grid layout with dynamic content",
  "Create a custom tooltip for icons and buttons",
];
export function VanishInput() {
  const [isloading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState<string>("");
  const user = useAuth();
  
  const navigate = useNavigate();
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
     if(!user.userId){
      toast.error("please signIn")
      return
     }
    

    if (prompt) {
      setIsLoading(true)
      const response = await axios.post(`${BASEURL}generate-conversation`,{
        userId: user.userId
      })
      const conversation = await response.data.data
      navigate(`generate/${conversation.id}`,{state:prompt});
      setIsLoading(false)

    }
    e.preventDefault();
  };
  return (
    <div className="h-[40rem] flex flex-col justify-center  items-center px-4">
      <h2 className="mb-10 sm:mb-20 text-xl text-center sm:text-5xl dark:text-white text-black">
        Ask Aceternity UI Anything
      </h2>
      <PlaceholdersAndVanishInput
        isDisabled={isloading}
        placeholders={placeholders}
        onChange={handleChange}
        onSubmit={onSubmit}
      />
    </div>
  );
}
