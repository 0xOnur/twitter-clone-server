import { Document } from "mongoose";

declare global {
    type IDocument = Document;
}
