import { Server, Socket } from "socket.io";
import { ISocket } from "../types/ISocket";
import chatSchema from "../schemas/chat.schema";

export default function initializeChatSocket(server: any) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000", // Uygun CORS ayarlarınızı yapın
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket: ISocket, next) => {
    const userId = socket.handshake.auth.userId;

    if (!userId) return next(new Error("invalid user"));
    socket.userId = userId;
    next();
  });

  io.on("connection", async (socket: ISocket) => {
    console.log("User conncected:", {
      userId: socket.userId,
      socketId: socket.id,
    });

    socket.join(socket.userId!);

    const conversations = (
      await chatSchema.find({
        participants: {
          $elemMatch: {
            user: socket.userId,
            hasLeft: false,
          },
        },
      })
    ).map((conversation) => conversation._id);
    for (const conversation of conversations) {
      socket.join(conversation.toString());
    }

    socket.on("joinConversation", (conversationId: string) => {
      socket.join(conversationId);
      console.log("joinConversation", {
        conversationId: conversationId,
        userId: socket.userId,
      });
    });

    socket.on("leaveConversation", (conversationId: string) => {
      socket.leave(conversationId);
      console.log("leaveConversation", {
        conversationId: conversationId,
        userId: socket.userId,
      });
    });

    socket.on("sendMessage", ({ conversationId, message }) => {
      console.log(conversationId, message);
      socket.broadcast.to(conversationId).emit("getMessage", message);
    });

    socket.on("readMessage", ({ conversationId, message }) => {
      console.log("readMessage", { conversationId:conversationId, message: message, userId: socket.userId });
    });

    socket.on("disconnect", () => {
      console.log("Kullanıcı bağlantıyı kesti:", socket.id);
    });
  });
}
