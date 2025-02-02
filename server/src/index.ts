import express, { Request, response, Response } from "express";
import { generateCode } from "./AI/generateCode";
import { Webhook } from "svix";
import dotenv from "dotenv";
import bodyParser = require("body-parser");
dotenv.config();
import cors from "cors";
import { prismaClient } from "./config/prismaClient";
import crypto from "node:crypto";
import { chat } from "prisma/prisma-client";
import axios from "axios";

const app = express();
//app.use(express.raw({ type: "*/*", limit: "10mb" }));
app.use(cors());
app.use(express.json());
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

      if (getUser.credit < 4) {
        return res.json("Insufficient credit");
      }

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

      if (getPreviousChats.length > 0) {
        finalPrompt = `This is the previous chat of user you can use this as context for  prompt and generate short message ${previousResponses} Current Prompt : ${finalPrompt}`;
      }

      const response = await generateCode(finalPrompt);

      if (!response.content) throw new Error("Error while generating code");

      const parsedResponse: any = JSON.parse(response.content);
      await prismaClient.user.update({
        where: {
          id: userId,
        },
        data: {
          credit: {
            decrement: 4,
          },
        },
      });
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

app.post(
  "/create-payment",
  async (req: Request, res: Response): Promise<any> => {
    const { userId, planType } = req.body;
    console.log("🚀 ~ planType:", planType);
    console.log("🚀 ~ userId:", userId);

    if (!userId || !planType) {
      return res.json("invalid request");
    }

    try {
      let variantId;
      const storeId = process.env.STORE_ID;
      const productId = process.env.PRODUCT_ID;
      const basicId = process.env.BASIC_ID;
      const standardId = process.env.STANDARD_ID;
      const premiumId = process.env.PREMIUM_ID;

      if (!storeId || !productId) throw new Error("invalid store id");

      if (planType == "BASIC" && basicId) {
        variantId = basicId;
      } else if (planType == "STANDARD" && standardId) {
        variantId = standardId;
      } else if (planType == "PREMIUM" && premiumId) {
        variantId = premiumId;
      } else {
        return res.json("Invalid plan type");
      }

      const user = await prismaClient.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) throw new Error("user not found");

      const response = await axios.post(
        "https://api.lemonsqueezy.com/v1/checkouts",
        {
          data: {
            type: "checkouts",
            attributes: {
              checkout_data: {
                custom: {
                  user_id: user.id,
                  user_email: user.email,
                  user_firstName: user.firstName,
                },
              },
            },

            relationships: {
              store: {
                data: {
                  type: "stores",
                  id: storeId,
                },
              },
              variant: {
                data: {
                  type: "variants",
                  id: variantId,
                },
              },
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.API_KEY}`,
            Accept: "application/vnd.api+json",
            "Content-Type": "application/json",
          },
        }
      );
      return res.json({ url: response.data.data.attributes.url });
    } catch (error: any) {
      console.log("🚀 ~ error:", error);
      return res.json("something went wrong");
    }
  }
);

app.post(
  "/webhook/lemon-squeezy",
  async (req: Request, res: Response): Promise<any> => {
    const SECRET = process.env.WEBHOOK_SECRET_LEMON_SQUEEZY;

    try {
      const body = req.body;
      const variantId = body.data.attributes.variant_id;

      const { user_id, user_email } = body.meta.custom_data;

      if (!user_id || !variantId) throw new Error("Invalid userID");
      const Basic_plan = process.env.BASIC_ID;
      const standard_plan = process.env.STANDARD_ID;
      const premium_plan = process.env.PREMIUM_ID;
      let credit;
      if (variantId == Basic_plan) {
        credit = 1000;
      } else if (variantId == standard_plan) {
        credit = 5000;
      } else if (variantId == premium_plan) {
        credit = 10000;
      } else {
        throw new Error("invalid variant id");
      }

      // {

      //   console.log("🚀 ~ SECRET:", SECRET);
      //   if (!SECRET) throw new Error("invalid");

      //   const hmac = crypto.createHmac("sha256", SECRET);

      //   const digest = Buffer.from(hmac.update(req.body).digest("hex"), "hex");

      //   const signature = Buffer.from(req.get("X-Signature") || "", "hex");
      //   console.log(crypto.timingSafeEqual(digest, signature));

      //   // Use timingSafeEqual to avoid timing attacks
      //   if (!crypto.timingSafeEqual(digest, signature)) {
      //     console.log("Invalid signature.");
      //     res.status(400).send("Invalid signature.");
      //     return;
      //   }
      // }

      // console.log("🚀 ~ variantId:", typeof variantId);

      const updateUser = await prismaClient.user.update({
        where: {
          id: user_id,
        },
        data: {
          credit: {
            increment: credit,
          },
        },
      });

      res.json("ok");
    } catch (error) {
      console.log("🚀 ~ error:", error);
      return res.json("Error");
    }
  }
);

app.get(
  "/get-user-credit/:userId",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const user_Id = req.params["userId"];

      if (!user_Id) {
        return res.json("Invalid user");
      }

      const getUser = await prismaClient.user.findUnique({
        where: {
          id: user_Id,
        },
      });

      return res.json({
        success: true,
        message: "successfully fetched",
        data: getUser?.credit,
      });
    } catch (error) {
      console.log("🚀 ~ app.get ~ error:", error);
      return res.json("something went wrong");
    }
  }
);

app.listen(8000, () => console.log("🟢 Running at 8000"));
