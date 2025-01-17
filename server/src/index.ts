import express, { Request, response, Response } from "express";
import { generateCode } from "./AI/generateCode";
import { Webhook } from "svix";
import dotenv from "dotenv";
import bodyParser = require("body-parser");
dotenv.config();
import cors from "cors";
import { prismaClient } from "./config/prismaClient";

import { chat } from "prisma/prisma-client";

const app = express();
app.use(cors());
app.use(bodyParser());

app.get("/", async (req: Request, res: Response): Promise<any> => {
  // const response: any = await generateCode(
  //   "Build a fully responsive sidebar  component "
  // );
  // console.log(req.headers);

  //const data: any = JSON.parse(response.content);
  // const title = data.projectTitle
  // const message = data.explanation
  // const files = data.files
  //console.log(data.files);

  return res.json("data");
});

app.post(
  "/generate-conversation",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.json("Invalid user id ");
      }

      const getUser = await prismaClient.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!getUser) throw new Error("Invalid user");

      const conversation = await prismaClient.conversation.create({
        data: {
          userId: getUser.id,
        },
      });

      return res.json({
        success: true,
        message: "Conversation created ",
        data: { ...conversation },
      });
    } catch (error) {
      console.log("🚀 ~ error:", error);
      return res.json("Something went wrong");
    }
  }
);

app.post(
  "/generate-component",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { prompt, userId, conversationId } = req.body;
      let finalPrompt = prompt;
      
      if (!userId || !prompt || !conversationId) {
        return res.json("Invalid request");
      }

      const getUser = await prismaClient.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!getUser) throw new Error("Invalid user");

      const getConversation = await prismaClient.conversation.findUnique({
        where: {
          id: conversationId,
        },
      });
      if (!getConversation) throw new Error("Invalid conversation");

      const getPreviousChats = await prismaClient.chat.findMany({
        where: {
          conversationId: getConversation.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const previousResponses = getPreviousChats.reduce(
        (acc: string, chat: chat) => {
          return `${chat.projectTitle} ${chat.message} ${chat.code}`;
        },
        ""
      );
     

      if(getPreviousChats.length >0 ){
        finalPrompt = `This is the previous chat of user you can use this as context for  prompt and generate short message ${previousResponses} Current Prompt : ${finalPrompt}`
      }
       
       
      const response = await generateCode(finalPrompt);

      if (!response.content) throw new Error("Error while generating code");

      const parsedResponse: any = JSON.parse(response.content);

      const saveResponse = await prismaClient.chat.create({
        data: {
          conversationId: conversationId,
          code: JSON.stringify(parsedResponse.files),
          message: parsedResponse.explanation,
          prompt: prompt,
          projectTitle: parsedResponse.projectTitle,
        },
      });
      return res.json({
        success: true,
        message: "Successfully generated",
        data: {
          ...saveResponse,
        },
      });
    } catch (error) {
      console.log("🚀 ~ error:", error);
      res.json("something went wrong");
    }
  }
);
     

app.post(
  "/webhook-clerk",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const SIGNING_SECRET = process.env.WEBHOOK_SECRET;
      console.log("request clammed");

      if (!SIGNING_SECRET) {
        throw new Error(
          "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local"
        );
      }

      const wh = new Webhook(SIGNING_SECRET);

      const headerPayload = req.headers;

      const svix_id = headerPayload["svix-id"];
      const svix_timestamp = headerPayload["svix-timestamp"];
      const svix_signature = headerPayload["svix-signature"];

      if (!svix_id || !svix_timestamp || !svix_signature) {
        return res.json("Error: Missing Svix headers");
      }

      const payload = req.body;

      const body = JSON.stringify(payload);

      let evt;

      try {
        evt = wh.verify(body, {
          //@ts-ignore
          "svix-id": svix_id,
          //@ts-ignore
          "svix-timestamp": svix_timestamp,
          //@ts-ignore
          "svix-signature": svix_signature,
        });
      } catch (err) {
        console.error("Error: Could not verify webhook:", err);
        return res.json("Invalid request");
      }

      const user = await prismaClient.user.create({
        data: {
          id: payload.data.id,
          firstName: payload.data.first_name,
          //@ts-ignore
          lastName: payload.data.last_name,
          email: payload.data.email_addresses[0].email_address,
          avatarUrl: payload.data.image_url,
        },
      });

      console.log("🚀 ~ user:", user);

      return res.status(200).json("Webhook Received");
    } catch (error) {
      console.log("🚀 ~ error:", error);
      return res.status(500).json("something went wrong");
    }
  }
);

app.listen(8000, () => console.log("🟢 Running at 8000"));
