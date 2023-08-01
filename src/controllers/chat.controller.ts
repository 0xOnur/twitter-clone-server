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
      lastMessage: { $exists: true },
    })
      .populate("participants.user", "-password")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    // Remove users who have left (hasLeft: true) from the participants array
    chats.forEach(chat => {
      chat.participants = chat.participants.filter(participant => !participant.hasLeft);
    });

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

// Create conversation
export const createConversation = async (req: IAuthenticateRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const users:IUser[] = req.body.users;

    let userIDs = users.map(user => user._id);

    if (!userIDs.includes(userId!)) {
      userIDs.push(userId!);
    }

    const isGorup = userIDs.length > 2;

    //conversations control where participants already exist
    const chat = await Chat.findOne({
      $and: [
        { 'participants.user': { $all: userIDs.map(id => new Types.ObjectId(id)) } },
        { 'participants': { $size: userIDs.length } }
      ]
    });
    
    let participants = userIDs.map(userID => ({
      user: userID,
      hasLeft: false,
      isPinned: false
    }));
    
    if (chat) {
      return res.status(200).json(chat);
    }else {
      const newChat = await Chat.create({
        participants: participants,
        isGroupChat: isGorup,
      });
      const createdChat = await Chat.findById(newChat._id).populate("participants.user", "-password");
      res.status(200).json(createdChat);
    }

  } catch (error) {
    res.status(500).json(error);
  }
};