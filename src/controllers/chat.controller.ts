import { IAuthenticateRequest } from "../types/IAuthenticateRequest";
import { Request, Response } from "express";
import Chat from "../schemas/chat.schema";
import Message from "../schemas/message.schema";

// Get User Chats
export const getUserChats = async (
  req: IAuthenticateRequest,
  res: Response
) => {
  try {
    const user = req.user;
    const chats = await Chat.find({ participants: user?._id })
      .populate("participants", "-password")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json(error);
  }
};

// Get Chat Messages
export const getChatMessages = async (req: Request, res: Response) => {
  try {
    const chatId = req.params.chatId;
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "-password")
      .sort({ createdAt: -1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json(error);
  }
};

// Pin conversation
export const pinConversation = async (req: Request, res: Response) => {
  try {
    const chatId = req.params.chatId;
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json("Chat not found");
    }
    chat.isPinned = !chat.isPinned;
    await chat.save();

    res.status(200).json({ message: "Conversation pinned" });
  } catch (error) {
    res.status(500).json(error);
  }
};

// Unpin conversation
export const unpinConversation = async (req: Request, res: Response) => {
  try {
    const chatId = req.params.chatId;
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json("Chat not found");
    }
    chat.isPinned = !chat.isPinned;
    await chat.save();

    res.status(200).json({ message: "Conversation unpinned" });
  } catch (error) {
    res.status(500).json(error);
  }
};
