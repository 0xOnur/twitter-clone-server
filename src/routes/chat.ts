import {
  createConversation,
  deleteConversation,
  getChat,
  getChatMessages,
  getUserChats,
  pinConversation,
  unpinConversation,
} from "../controllers/chat.controller";
import authMiddleware from "../middlewares/authMiddleware";
import express from "express";

// http://localhost:5000/chat/
const chatRoutes = express.Router();

chatRoutes.get("/get-chats", authMiddleware, getUserChats);
chatRoutes.get("/get-chat/:chatId", authMiddleware, getChat);
chatRoutes.get("/get-chat-messages/:chatId", authMiddleware, getChatMessages);

chatRoutes.put("/pin-conversation/:chatId", authMiddleware, pinConversation);
chatRoutes.put(
  "/unpin-conversation/:chatId",
  authMiddleware,
  unpinConversation
);

chatRoutes.delete(
  "/delete-conversation/:chatId",
  authMiddleware,
  deleteConversation
);

chatRoutes.post("/create-conversation", authMiddleware, createConversation);

export default chatRoutes;
