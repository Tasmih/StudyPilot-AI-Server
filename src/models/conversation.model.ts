import { ObjectId } from "mongodb";

export interface IMessage {
  id: string; // Unique message identifier
  sender: "user" | "ai";
  content: string;
  createdAt: Date;
}

export interface IConversation {
  _id?: ObjectId;
  userId: string; // Owner ID (from req.user.id)
  title: string; // Topic name
  messages: IMessage[];
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}
