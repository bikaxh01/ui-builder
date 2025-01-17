import React from "react";

import { BackgroundBeamsWithCollision } from "../common/ui/Background_beams";
import { VanishInput } from "./Input";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import Navbar from "../common/ui/Navbar";
function PromptPage() {
  return (
    <div>
      <Navbar />

      <BackgroundBeamsWithCollision>
        <VanishInput />
      </BackgroundBeamsWithCollision>
    </div>
  );
}

export default PromptPage;
