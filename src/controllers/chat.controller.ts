import { IAuthenticateRequest } from "../types/IAuthenticateRequest";
import { Response } from "express";
import Chat from "../schemas/chat.schema";
import Message from "../schemas/message.schema";
import Tweet from "../schemas/tweet.schema";
import { Types } from "mongoose";
import {
  findConversationAmongUsers,
  reactivateUserIfLeftChat,
  ensureConversationsExist,
  sendMessageToAllChats,
  sendSingleMessage,
  broadcastReadStatus,
} from "../helpers/chat.helpers";

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
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "-password",
        },
      })
      .sort({ updatedAt: -1 });

    // Remove users who have left (hasLeft: true) from the participants array
    chats.forEach((chat) => {
      chat.participants = chat.participants.filter(
        (participant) => !participant.hasLeft
      );
    });

    res.status(200).json(chats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get Chat
export const getChat = async (req: IAuthenticateRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const chatId = req.params.chatId;

    const chat = await Chat.findOne({
      _id: chatId,
      participants: {
        $elemMatch: {
          user: userId,
          hasLeft: false,
        },
      },
    }).populate("participants.user", "-password")
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "-password",
      },
    });

    if (!chat) {
      return res.status(404).json("Chat not found");
    }

    // Remove users who have left (hasLeft: true) from the participants array
    chat.participants = chat.participants.filter(
      (participant) => !participant.hasLeft
    );

    res.status(200).json(chat);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get Chat Messages
export const getChatMessages = async (
  req: IAuthenticateRequest,
  res: Response
) => {
  try {
    const chatId = req.params.chatId;

    // Get the page and limit parameters from the request, or set default values
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.limit as string) || 10;

    // Calculate the number of documents to skip
    let skip = (page - 1) * perPage;
    let limit = perPage;

    const chat = Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json("Chat not found");
    }

    const messages = await Message.find({
      chat: chatId,
      removedBy: { $ne: req.user?._id },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "username displayName avatar cover isVerified")
      .populate("readBy", "username displayName avatar cover isVerified")
      .populate("replyTo");

    // Find the total number of user documents in the database
    const totalItems = await Message.countDocuments({ chat: chatId });
    const totalPages = Math.ceil(totalItems / limit);

    // Construct the response
    const response = {
      page: page,
      perPage: limit,
      totalItems: totalItems,
      totalPages: totalPages,
      data: messages,
    };

    res.status(200).json(response);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Pin conversation
export const pinConversation = async (
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

    const participant = chat.participants.find((p) => p.user.equals(userId));

    if (!participant) {
      return res.status(404).json("You are not a participant of this chat");
    }

    participant.isPinned = true;

    await chat.save();

    res.status(200).json({ message: "Conversation pinned" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Unpin conversation
export const unpinConversation = async (
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

    const participant = chat.participants.find((p) => p.user.equals(userId));

    if (!participant) {
      return res.status(404).json("You are not a participant of this chat");
    }

    participant.isPinned = false;

    await chat.save();

    res.status(200).json({ message: "Conversation unpinned" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
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

    const participant = chat.participants.find((p) => p.user.equals(userId));

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
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Create conversation
export const createConversation = async (
  req: IAuthenticateRequest,
  res: Response
) => {
  try {
    const userId = new Types.ObjectId(req.user?._id);
    const users: IUser[] = req.body.users;

    let userIDs = users.map((user) => user._id);

    if (!userIDs.includes(userId!)) {
      userIDs.push(userId!);
    }

    const isGorup = userIDs.length > 2;

    //check if a chat already exists with the selected users
    const chat = await findConversationAmongUsers(userIDs);

    if (chat) {
      //if req user has left the cat re-activate user
      reactivateUserIfLeftChat(chat, userId);
      return res.status(200).json(chat);
    }

    let participants = userIDs.map((userID) => ({ user: userID }));

    const newChat = await Chat.create({
      participants: participants,
      isGroupChat: isGorup,
    });
    const createdChat = await Chat.findById(newChat._id).populate(
      "participants.user",
      "-password"
    );
    res.status(200).json(createdChat);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Send message
export const sendMessage = async (req: IAuthenticateRequest, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user?._id);

    const messageData: IMessage = {
      chat: req.body.chat,
      sender: new Types.ObjectId(userId),
      content: req.body.content,
      replyTo: req.body.replyTo,
      type: req.body.type,
    };

    const result = sendSingleMessage(messageData);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Send Tweet
export const sendTweet = async (req: IAuthenticateRequest, res: Response) => {
  try {
    const senderId = new Types.ObjectId(req.user?._id);

    const { tweetId, messageContent, selectedUsers, selectedConversations } = req.body;

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
      return res.status(404).json({ message: "Tweet can not found" });
    }

    if (selectedUsers.length < 1 && selectedConversations.length < 1) {
      return res
        .status(400)
        .json({ message: "Please select a user or conversation" });
    }

    let conversationsIDs: string[] = selectedConversations.map(
      (conv: IChat) => conv._id
    );
    const userIDs: string[] = selectedUsers.map((user: IUser) => user._id);

    if (userIDs.length > 0) {
      conversationsIDs = await ensureConversationsExist(
        senderId,
        userIDs,
        conversationsIDs
      );
    }

    const result = await sendMessageToAllChats(
      senderId,
      tweetId,
      messageContent,
      conversationsIDs
    );

    if (result.success) {
      res.status(200).json({ message: "Messages sent successfully." });
    } else {
      return res.status(400).json({
        error: result.error || "Unknown error occurred.",
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Read message
export const readMessage = async (req: IAuthenticateRequest, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user?._id);
    const messageId = req.params.messageId;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json("Message not found");
    }

    const chatId = message.chat;
    const isRead = message.readBy!.includes(userId);

    if (!isRead) {
      message.readBy!.push(userId);
      await message.save();
    }

    broadcastReadStatus(chatId.toString(), message);

    res.status(200).json({ message: "Message read" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete message (hidden message who requested user)
export const deleteMessage = async (
  req: IAuthenticateRequest,
  res: Response
) => {
  try {
    const userId = new Types.ObjectId(req.user?._id);
    const messageId = req.params.messageId;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json("Message not found");
    }

    const isRemoved = message?.removedBy!.includes(userId);

    if (isRemoved) {
      return res.status(404).json("Message already removed");
    }

    message.removedBy!.push(userId);
    await message.save();

    res.status(200).json({ message: "Message removed" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
