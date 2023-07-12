import { Request } from "express";

// Extend the Request type and create a new type
interface IAuthenticateRequest extends Request {
  user?: IDecoded;
  files?: any;
}