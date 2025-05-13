import { StatusCodes } from 'http-status-codes';
import { Chat } from '../chat/chat.model';
import { IMessage, IReaction } from './message.interface';
import { Message } from './message.model';
import AppError from '../../../errors/AppError';

const sendMessageToDB = async (
      payload: IMessage,
    ): Promise<IMessage> => {
      const response = await Message.create(payload);
    
      // Update the lastMessage and readBy fields of the associated chat
      const chat = await Chat.findByIdAndUpdate(
        response?.chatId,
        { lastMessage: response._id, readBy: [payload.sender.toString()] },
        { new: true },
      );
    
      //@ts-ignore
      const io = global.io;
    
      // Ensure `chat?.participants` is an array and filter out invalid values
      const notificationReceiver = chat?.participants
        ?.filter((participant) => participant && participant.toString() !== payload.sender.toString()) 
        .map((participant) => participant.toString())
        .find(() => true); 
    
      if (notificationReceiver && io) {
        io.emit(`newMessage::${notificationReceiver}`, response); 
      }
    
      return response;
    };
    

const getMessagesFromDB = async (chatId: string): Promise<IMessage[]> => {
  const response = await Message.find({ chatId: chatId }).populate({
    path: 'sender',
    select: 'userName email profile',
  });
  const formattedMessages = response.map((message) => {
    return {
      ...message.toObject(),
      isDeleted: message.isDeleted,
      content: message.isDeleted
        ? 'This message has been deleted.'
        : message.text,
    };
  });
  return formattedMessages;
};
const addReactionToMessage = async (
  userId: string,
  messageId: string,
  reactionType: 'like' | 'love' | 'thumbs_up' | 'laugh' | 'angry' | 'sad',
) => {
  // Validate the reaction type
  const validReactions = ['like', 'love', 'thumbs_up', 'laugh', 'angry', 'sad'];
  if (!validReactions.includes(reactionType)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid reaction type');
  }

  try {
    // Find the message by ID
    const message = await Message.findById(messageId);
    if (!message) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Message not found');
    }

    // Check if the user has already reacted to the message
    const existingReaction = message.reactions.find(
      (reaction) => reaction.userId.toString() === userId.toString(),
    );

    if (existingReaction) {
      // Update the existing reaction
      existingReaction.reactionType = reactionType;
      existingReaction.timestamp = new Date();
    } else {
      // Add a new reaction
      message.reactions.push({ userId, reactionType, timestamp: new Date() });
    }

    // Save the updated message
    const updatedMessage = await message.save();

    // Return the updated message as response
    return updatedMessage; 
  } catch (error) {
    console.error('Error updating reaction:', error);
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Internal server error!',
    );
  }
};
const deleteMessage = async (userId: string, messageId: string) => {
  try {
    // Find the message by messageId
    const message = await Message.findById(messageId);
    if (!message) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Message not found');
    }

    // Ensure the user is the sender of the message
    if (message.sender.toString() !== userId.toString()) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        'You can only delete your own messages',
      );
    }
    const updateMessage = await Message.findByIdAndUpdate(
      message._id,
      {
        $set: { isDeleted: true },
      },
      { new: true },
    );

    return updateMessage;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Internal server error',
    );
  }
};
export const MessageService = {
  sendMessageToDB,
  getMessagesFromDB,
  addReactionToMessage,
  deleteMessage,
};
