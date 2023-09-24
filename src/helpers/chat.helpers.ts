import { Types, Document } from "mongoose";
import Chat from "../schemas/chat.schema";
import Message from "../schemas/message.schema";
import { io } from "../sockets/socket";

type SendMessageResult = { success: boolean; error?: string };

export const broadcastMessage = (chatId: string, message: IMessage) => {
    io.to(chatId).emit("getMessage", message);
};

export const broadcastReadStatus = (chatId: string, message: IMessage) => {
  io.to(chatId).emit("readMessage", message);
}

export const findDirectConversation = async (
  userId: Object,
  currentUserId: string
) => {
  const existingConversation = await Chat.findOne({
    $and: [
      {
        participants: {
          $elemMatch: {
            user: userId,
          },
        },
      },
      {
        participants: {
          $elemMatch: {
            user: new Types.ObjectId(currentUserId),
          },
        },
      },
      { participants: { $size: 2 } },
    ],
  });

  return existingConversation;
};

export const findConversationAmongUsers = async (userIDs: string[]) => {
  const chat = await Chat.findOne({
    $and: [
      {
        "participants.user": {
          $all: userIDs.map((id) => new Types.ObjectId(id)),
        },
      },
      { participants: { $size: userIDs.length } },
    ],
  });

  return chat;
};

export const reactivateUserIfLeftChat = async (chat: any, userId: Object) => {
  const participant = chat.participants.find((p: any) => p.user.equals(userId));

  if (participant?.hasLeft) {
    participant.hasLeft = false;
  }
};

export const ensureConversationsExist = async (
  senderId: Object,
  userIDs: string[],
  conversationsIDs: string[]
) => {
  const updatedConversationsIDs = [...conversationsIDs];

  for (let currentUserId of userIDs) {
    const existingConversation = await findDirectConversation(
      senderId,
      currentUserId
    );

    if (existingConversation) {
      console.log(
        `Existing conversation for user ${currentUserId}:`,
        existingConversation._id
      );
      updatedConversationsIDs.push(existingConversation._id.toString());
    } else {
      const newConversation = new Chat({
        participants: [
          { user: senderId },
          { user: new Types.ObjectId(currentUserId) },
        ],
      });

      await newConversation.save();
      updatedConversationsIDs.push(newConversation._id.toString());
    }
  }

  return updatedConversationsIDs;
};

export const sendSingleMessage = async (messageData: IMessage) => {
  const message = new Message(messageData);
  
  const chat = await Chat.findById(message.chat);
  if (!chat) {
    throw new Error("Chat not found");
  }

  //Save message
  await message.save();

  //Update chat
  
  chat.lastMessage = message._id;
  await chat.save();

  //Send socket
  broadcastMessage(chat._id.toString(), message);
  return message;
};

export const sendMessageToAllChats = async (
  senderId: IObjectId,
  tweetId: IObjectId,
  messageContent: string,
  conversationsIDs: string[]
): Promise<SendMessageResult> => {
  try {
    await Promise.all(
      conversationsIDs.map((chatId) =>
        sendSingleMessage({
            chat: new Types.ObjectId(chatId),
            sender: senderId,
            content: messageContent,
            type: "tweet",
            tweet: tweetId,
        })
      )
    );
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: "An error occurred while sending messages to all chats.",
    };
  }
};
