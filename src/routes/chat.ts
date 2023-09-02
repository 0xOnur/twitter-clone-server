import {
  createConversation,
  deleteConversation,
  deleteMessage,
  getChat,
  getChatMessages,
  getUserChats,
  pinConversation,
  readMessage,
  sendMessage,
  unpinConversation,
} from "../controllers/chat.controller";
import authMiddleware from "../middlewares/authMiddleware";
import express from "express";
import { uploadMiddleware } from "../middlewares/uploadFileMiddleware";

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
chatRoutes.put("/read-message/:messageId", authMiddleware, readMessage);

chatRoutes.post("/send-message", authMiddleware, uploadMiddleware, sendMessage);
chatRoutes.delete("/delete-message/:messageId", authMiddleware, deleteMessage);

chatRoutes.delete(
  "/delete-conversation/:chatId",
  authMiddleware,
  deleteConversation
);

chatRoutes.post("/create-conversation", authMiddleware, createConversation);

export default chatRoutes;
