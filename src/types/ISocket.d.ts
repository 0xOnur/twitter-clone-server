import { Socket } from "socket.io"

interface ISocket extends Socket {
    userId?: string;
}