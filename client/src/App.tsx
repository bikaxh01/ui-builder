import { useEffect, useState } from "react";
import SandPack from "./components/Code Editor/SandPack";
import { BrowserRouter, Routes, Route } from "react-router";
import axios from "axios";
import PromptPage from "./components/landing/prompt";
import ConversationPage from "./components/conversationPage";
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import Pricing from "./components/pricing/Pricing";
import { Toaster } from 'sonner'

function App() {
  const [data, setData] = useState("");

  // async function getData() {
  //   const response = await axios.get("http://localhost:8000/");
  //   const jsonData = JSON.parse(response.data.content);

  //   setData(jsonData);
  // }

  // useEffect(() => {
  //   getData();
  // }, []);

  return (
    <div>
      <Toaster  richColors/>
      <Routes>
        <Route path="/" element={<PromptPage />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="generate">
          <Route path=":conversationId" element={<ConversationPage />} />
        </Route>
      </Routes>
     
    
    </div>
  );
}

export default App;
