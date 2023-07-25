import { IAuthenticateRequest } from "../types/IAuthenticateRequest";
import { Request, Response } from "express";
import Chat from "../schemas/chat.schema";
import Message from "../schemas/message.schema";
import { Types } from "mongoose";

// Get User Chats
export const getUserChats = async (
  req: IAuthenticateRequest,
  res: Response
) => {
  try {
    const userId = req.user?._id;

    const chats = await Chat.find({
      participants: {
        $elemMatch: {
          user: userId,
          hasLeft: false,
        },
      },
    })
      .populate("participants.user", "-password")
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
export const pinConversation = async (req: IAuthenticateRequest, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user?._id);
    const chatId = req.params.chatId;
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json("Chat not found");
    }

    const participant  = chat.participants.find((p) => p.user.equals(userId));

    if (!participant) {
      return res.status(404).json("You are not a participant of this chat");
    }

    participant.isPinned = true;
    
    await chat.save();

    res.status(200).json({ message: "Conversation pinned" });
  } catch (error) {
    res.status(500).json(error);
  }
};

// Unpin conversation
export const unpinConversation = async (req: IAuthenticateRequest, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user?._id);
    const chatId = req.params.chatId;
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json("Chat not found");
    }

    const participant  = chat.participants.find((p) => p.user.equals(userId));

    if (!participant) {
      return res.status(404).json("You are not a participant of this chat");
    }

    participant.isPinned = false;

    await chat.save();

    res.status(200).json({ message: "Conversation unpinned" });
  } catch (error) {
    res.status(500).json(error);
  }
};

// Remove Conversation (Leave conversation)
export const deleteConversation = async (
  req: IAuthenticateRequest,
  res: Response
) => {
  try {
    const userId = new Types.ObjectId(req.user?._id);
    const chatId = req.params.chatId;
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json("Chat not found");
    }

    const participant  = chat.participants.find((p) => p.user.equals(userId));

    if (!participant) {
      return res.status(404).json("You are not a participant of this chat");
    }

    // Set the user hasLeft field to true
    participant.hasLeft = true;

    //  check the chat participants length and delete or save
    if (chat.participants.every((p) => p.hasLeft)) {
      await chat.deleteOne();
    } else {
      await chat.save();
    }

    res.status(200).json({ message: "Conversation deleted" });
  } catch (error) {
    res.status(500).json(error);
  }
};
