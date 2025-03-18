import { chatService } from '../../chat/chat.service';
import { ObjectId } from 'mongodb';

interface IChat {
  _id: ObjectId | string;
  status: string;
  participants: string[];
}

interface ChatEventData {
  participant: string;
  userId: string;
}

interface CallbackResponse {
  status: 'Success' | 'Error';
  message: string;
  chatId?: string;
}

export const handleChatEvents = async (
  socket: any,
  data: ChatEventData,
  callback: (response: CallbackResponse) => void,
): Promise<void> => {
  try {
    // Early validation check
    if (!data.participant || !data.userId) {
      callback({
        status: 'Error',
        message: 'Please provide both participant and userId',
      });
      return;
    }

    // Check for existing chat first
    const existingChat = await chatService.getChatByParticipants(
      data.userId,
      data.participant,
    );

    if (existingChat && existingChat.status === 'accepted') {
      callback({
        status: 'Success',
        chatId: existingChat._id.toString(),
        message: 'Chat already exists',
      });
      return;
    }

    // Create new chat if none exists
    const chat = await chatService.createChat(data.userId, data.participant);

    if ('_id' in chat) {
      callback({
        status: 'Success',
        chatId: chat._id.toString(),
        message: 'Chat created successfully',
      });
    } else {
      callback({
        status: 'Error',
        message: 'Failed to create chat',
      });
    }
  } catch (error: any) {
    callback({
      status: 'Error',
      message: error.message || 'An unexpected error occurred',
    });
  }
};
