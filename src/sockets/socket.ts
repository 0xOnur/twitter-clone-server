import { Server } from "socket.io";
import {Server as HTTPServer} from "http"
import { ISocket } from "../types/ISocket";
import chatSchema from "../schemas/chat.schema";

export let io: Server;

export default function initializeChatSocket(server: HTTPServer) {
  io = new Server(server, {
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
    });

    socket.on("leaveConversation", (conversationId: string) => {
      socket.leave(conversationId);
    });
  });
}
