import { ObjectId } from "mongodb";
import type { WithId } from "mongodb";
import { db } from "../config/db.js";
import type { IConversation, IMessage } from "../models/conversation.model.js";

const collection = db.collection<IConversation>("conversations");

export const conversationService = {
  /**
   * Creates a new conversation under the user's name.
   */
  async create(userId: string, title: string): Promise<IConversation> {
    const newConv: IConversation = {
      userId,
      title: title || "New Conversation",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newConv);
    return { ...newConv, _id: result.insertedId };
  },

  /**
   * Fetches all conversations matching the user's userId.
   */
  async getAllForUser(userId: string): Promise<WithId<IConversation>[]> {
    return collection.find({ userId }).sort({ updatedAt: -1 }).toArray();
  },

  /**
   * Fetches a conversation by ID, checking ownership.
   */
  async getById(id: string, userId: string): Promise<WithId<IConversation> | null> {
    if (!ObjectId.isValid(id)) return null;
    return collection.findOne({ _id: new ObjectId(id), userId });
  },

  /**
   * Deletes a conversation by ID, checking ownership.
   */
  async delete(id: string, userId: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const result = await collection.deleteOne({ _id: new ObjectId(id), userId });
    return result.deletedCount > 0;
  },

  /**
   * Adds a new message payload to a conversation.
   */
  async addMessage(
    id: string,
    userId: string,
    message: Omit<IMessage, "createdAt">
  ): Promise<WithId<IConversation> | null> {
    if (!ObjectId.isValid(id)) return null;

    const newMessage: IMessage = {
      ...message,
      createdAt: new Date(),
    };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), userId },
      {
        $push: { messages: newMessage },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" }
    );

    return result;
  },
};
