import { deleteConversation, getUserChats, pinConversation, unpinConversation } from "../controllers/chat.controller";
import authMiddleware from "../middlewares/authMiddleware";
import express from "express"

// http://localhost:5000/chat/
const chatRoutes = express.Router();

chatRoutes.get("/get-chats", authMiddleware, getUserChats);

chatRoutes.put("/pin-conversation/:chatId", authMiddleware, pinConversation)
chatRoutes.put("/unpin-conversation/:chatId", authMiddleware, unpinConversation)

chatRoutes.delete("/delete-conversation/:chatId", authMiddleware, deleteConversation)


export default chatRoutes;