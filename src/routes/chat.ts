import {
  addUsersToGroup,
  createConversation,
  deleteConversation,
  deleteMessage,
  editGroup,
  getChat,
  getChatMessages,
  getUserChats,
  pinConversation,
  readMessage,
  sendMessage,
  sendTweet,
  unpinConversation,
} from "../controllers/chat.controller";
import { imageUploadMiddleware } from "../middlewares/imageUploadMiddleware";
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
chatRoutes.put("/read-message/:messageId", authMiddleware, readMessage);
chatRoutes.put("/edit-group", authMiddleware, imageUploadMiddleware, editGroup);
chatRoutes.put("/add-user-to-group/:chatId", authMiddleware, addUsersToGroup);

chatRoutes.post("/send-message", authMiddleware, imageUploadMiddleware, sendMessage);
chatRoutes.post("/send-tweet", authMiddleware, sendTweet);

chatRoutes.delete("/delete-message/:messageId", authMiddleware, deleteMessage);
chatRoutes.delete(
  "/delete-conversation/:chatId",
  authMiddleware,
  deleteConversation
);

chatRoutes.post("/create-conversation", authMiddleware, createConversation);

export default chatRoutes;
